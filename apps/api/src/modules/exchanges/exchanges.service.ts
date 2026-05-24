import type {
  CreateExchangePayload,
  ExecuteExchangeResultDto,
  ExchangeProposalDto,
  PendingSettlementDto
} from "@mundial-album/shared";
import type { ExchangeProposal, Prisma, User } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import { toUserDto } from "../../utils/dto.js";
import { HttpError } from "../../utils/http-error.js";
import { getAlbum, getAlbumSummary } from "../albums/albums.service.js";
import { buildCompareAlbumDto } from "./exchange.mapper.js";
import {
  isValidAllOneToOneSelection,
  isValidOneToOneSelection
} from "./exchange.service.js";
import { computeGiveTransfer, computeReceiveTransfer } from "./exchange-transfer.js";
import {
  classifyCustomExchangeType,
  computeCustomPendingCounts,
  validateCustomSelection
} from "./custom-exchange.js";
import {
  buildPendingSettlementMessage,
  buildSettlementSteps,
  buildSettlementTransferPlan,
  getPendingCountsForViewer,
  isValidSettlementStep,
  reducePendingCounts,
  type SettlementStep,
  type SettlementTransferPlan
} from "./pending-settlement.js";

type ExchangeSnapshot = {
  stickersGivenByMe: string[];
  stickersGivenByOther: string[];
  pendingCountForMe: number;
  pendingCountForOther: number;
  type: ExchangeProposal["type"];
  notes: string;
};

async function assertDistinctUsers(fromUserId: string, toUserId: string): Promise<void> {
  if (fromUserId === toUserId) {
    throw new HttpError(400, "No podés crear un intercambio con el mismo usuario.");
  }

  const [fromUser, toUser] = await Promise.all([
    prisma.user.findUnique({ where: { id: fromUserId } }),
    prisma.user.findUnique({ where: { id: toUserId } })
  ]);

  if (!fromUser) {
    throw new HttpError(404, "User not found");
  }

  if (!toUser) {
    throw new HttpError(404, "User not found");
  }
}

async function buildExchangeSnapshot(
  fromUserId: string,
  toUserId: string,
  notes?: string,
  selection?: SettlementStep
): Promise<ExchangeSnapshot> {
  const [myAlbum, otherAlbum] = await Promise.all([
    getAlbum(fromUserId),
    getAlbum(toUserId)
  ]);
  const comparison = buildCompareAlbumDto(myAlbum, otherAlbum);
  const canGive = comparison.canGive.map((sticker) => sticker.code);
  const canReceive = comparison.canReceive.map((sticker) => sticker.code);

  if (comparison.type === "NOT_AVAILABLE") {
    throw new HttpError(409, comparison.message);
  }

  if (!selection) {
    throw new HttpError(400, "Seleccioná un intercambio uno a uno.");
  }

  const transferPlan = validateSuggestedOneToOneSelection(selection, canGive, canReceive);

  if (transferPlan.settledCount === 0) {
    throw new HttpError(409, comparison.message);
  }

  return {
    stickersGivenByMe: transferPlan.stickersGivenByMe,
    stickersGivenByOther: transferPlan.stickersGivenByOther,
    pendingCountForMe: 0,
    pendingCountForOther: 0,
    type: transferPlan.settledCount === 1 ? "DIRECT" : "MULTIPLE",
    notes: notes ?? comparison.message
  };
}

async function buildCustomExchangeSnapshot(
  fromUserId: string,
  toUserId: string,
  selection: SettlementStep,
  notes?: string
): Promise<ExchangeSnapshot> {
  const [myAlbum, otherAlbum] = await Promise.all([
    getAlbum(fromUserId),
    getAlbum(toUserId)
  ]);

  validateCustomSelection(myAlbum, otherAlbum, selection);

  const giveCount = selection.stickersGivenByMe.length;
  const receiveCount = selection.stickersGivenByOther.length;
  const pending = computeCustomPendingCounts(giveCount, receiveCount);

  return {
    stickersGivenByMe: selection.stickersGivenByMe,
    stickersGivenByOther: selection.stickersGivenByOther,
    pendingCountForMe: pending.pendingCountForMe,
    pendingCountForOther: pending.pendingCountForOther,
    type: classifyCustomExchangeType(giveCount, receiveCount),
    notes: notes ?? `Intercambio personalizado con @${otherAlbum.user.name}.`
  };
}

function validateSuggestedOneToOneSelection(
  selection: SettlementStep,
  canGive: string[],
  canReceive: string[]
): SettlementTransferPlan {
  if (isValidOneToOneSelection(selection, canGive, canReceive)) {
    return {
      stickersGivenByMe: selection.stickersGivenByMe,
      stickersGivenByOther: selection.stickersGivenByOther,
      settledCount: 1
    };
  }

  if (isValidAllOneToOneSelection(selection, canGive, canReceive)) {
    return {
      stickersGivenByMe: selection.stickersGivenByMe,
      stickersGivenByOther: selection.stickersGivenByOther,
      settledCount: selection.stickersGivenByMe.length
    };
  }

  throw new HttpError(409, "La selección de figuritas ya no está disponible para intercambiar.");
}

function validateAndBuildSelection(
  selection: SettlementStep,
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number
): SettlementTransferPlan {
  if (
    !isValidSettlementStep(selection, canGive, canReceive, pendingCountForMe, pendingCountForOther)
  ) {
    throw new HttpError(409, "La selección de figuritas ya no está disponible para intercambiar.");
  }

  return {
    stickersGivenByMe: selection.stickersGivenByMe,
    stickersGivenByOther: selection.stickersGivenByOther,
    settledCount: 1
  };
}

function validateAndBuildFinalizeSelection(
  selection: SettlementStep | undefined,
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number
): SettlementTransferPlan {
  if (selection) {
    return validateAndBuildSelection(
      selection,
      canGive,
      canReceive,
      pendingCountForMe,
      pendingCountForOther
    );
  }

  return buildSettlementTransferPlan(
    canGive,
    canReceive,
    pendingCountForMe,
    pendingCountForOther
  );
}

async function getTrackedUserSticker(
  tx: Prisma.TransactionClient,
  userId: string,
  stickerCode: string
) {
  const sticker = await tx.sticker.findUnique({ where: { code: stickerCode } });

  if (!sticker) {
    throw new HttpError(404, `Figurita ${stickerCode} no encontrada.`);
  }

  const userSticker = await tx.userSticker.findUnique({
    where: {
      userId_stickerId: {
        userId,
        stickerId: sticker.id
      }
    }
  });

  if (!userSticker) {
    throw new HttpError(
      409,
      `El álbum no tiene cargada la figurita ${stickerCode} para este usuario.`
    );
  }

  return { sticker, userSticker };
}

async function applyGiveSticker(
  tx: Prisma.TransactionClient,
  userId: string,
  stickerCode: string
): Promise<void> {
  const { userSticker } = await getTrackedUserSticker(tx, userId, stickerCode);

  let nextCounts;

  try {
    nextCounts = computeGiveTransfer({
      quantityOwned: userSticker.quantityOwned,
      quantityRepeated: userSticker.quantityRepeated
    });
  } catch {
    throw new HttpError(409, `No hay repetida disponible para ${stickerCode}.`);
  }

  await tx.userSticker.update({
    where: { id: userSticker.id },
    data: nextCounts
  });
}

async function applyReceiveSticker(
  tx: Prisma.TransactionClient,
  userId: string,
  stickerCode: string
): Promise<void> {
  const sticker = await tx.sticker.findUnique({ where: { code: stickerCode } });

  if (!sticker) {
    throw new HttpError(404, `Figurita ${stickerCode} no encontrada.`);
  }

  const userSticker = await tx.userSticker.findUnique({
    where: {
      userId_stickerId: {
        userId,
        stickerId: sticker.id
      }
    }
  });

  if (!userSticker) {
    await tx.userSticker.create({
      data: {
        userId,
        stickerId: sticker.id,
        quantityOwned: 1,
        quantityRepeated: 0
      }
    });
    return;
  }

  let nextCounts;

  try {
    nextCounts = computeReceiveTransfer({
      quantityOwned: userSticker.quantityOwned,
      quantityRepeated: userSticker.quantityRepeated
    });
  } catch {
    throw new HttpError(409, `La figurita ${stickerCode} ya está pegada para este usuario.`);
  }

  await tx.userSticker.update({
    where: { id: userSticker.id },
    data: nextCounts
  });
}

async function applyExchangeTransfers(
  tx: Prisma.TransactionClient,
  fromUserId: string,
  toUserId: string,
  snapshot: Pick<ExchangeSnapshot, "stickersGivenByMe" | "stickersGivenByOther">
): Promise<void> {
  for (const code of snapshot.stickersGivenByMe) {
    await applyGiveSticker(tx, fromUserId, code);
    await applyReceiveSticker(tx, toUserId, code);
  }

  for (const code of snapshot.stickersGivenByOther) {
    await applyGiveSticker(tx, toUserId, code);
    await applyReceiveSticker(tx, fromUserId, code);
  }
}

async function closeOpenSettlementBetweenUsers(
  tx: Prisma.TransactionClient,
  fromUserId: string,
  toUserId: string
): Promise<void> {
  await tx.exchangeProposal.updateMany({
    where: {
      status: "PENDING_SETTLEMENT",
      OR: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId }
      ]
    },
    data: {
      status: "CANCELLED"
    }
  });
}

function hasPendingBalance(proposal: Pick<ExchangeProposal, "pendingCountForMe" | "pendingCountForOther">): boolean {
  return proposal.pendingCountForMe > 0 || proposal.pendingCountForOther > 0;
}

function buildExecuteMessage(
  pending: Pick<ExchangeProposal, "pendingCountForMe" | "pendingCountForOther">,
  settledPairs: number
): string {
  if (pending.pendingCountForMe === 0 && pending.pendingCountForOther === 0) {
    return "Intercambio confirmado. Se actualizaron ambos álbumes.";
  }

  return `Intercambio parcial confirmado (${settledPairs} par${settledPairs === 1 ? "" : "es"}). Quedó un saldo pendiente para saldar más adelante.`;
}

function buildFinalizeMessage(settledPairs: number, completed: boolean): string {
  if (completed) {
    return "Pendiente saldado. El intercambio quedó completado.";
  }

  return `Se saldaron ${settledPairs} par${settledPairs === 1 ? "" : "es"} del pendiente. Todavía queda saldo por cerrar.`;
}

export async function createExchangeProposal(
  input: CreateExchangePayload
): Promise<ExchangeProposalDto> {
  await assertDistinctUsers(input.fromUserId, input.toUserId);
  const snapshot = await buildExchangeSnapshot(
    input.fromUserId,
    input.toUserId,
    input.notes
  );

  const proposal = await prisma.exchangeProposal.create({
    data: {
      fromUserId: input.fromUserId,
      toUserId: input.toUserId,
      status: input.status ?? "PROPOSED",
      type: snapshot.type,
      stickersGivenByMe: snapshot.stickersGivenByMe,
      stickersGivenByOther: snapshot.stickersGivenByOther,
      pendingCountForMe: snapshot.pendingCountForMe,
      pendingCountForOther: snapshot.pendingCountForOther,
      notes: snapshot.notes
    }
  });

  return toExchangeProposalDto(proposal);
}

function toSelection(
  stickersGivenByMe?: string[],
  stickersGivenByOther?: string[]
): SettlementStep | undefined {
  if (!stickersGivenByMe?.length && !stickersGivenByOther?.length) {
    return undefined;
  }

  return {
    stickersGivenByMe: stickersGivenByMe ?? [],
    stickersGivenByOther: stickersGivenByOther ?? []
  };
}

function mapStepsToSettlementOptions(
  steps: SettlementStep[],
  fromAlbum: Awaited<ReturnType<typeof getAlbum>>,
  toAlbum: Awaited<ReturnType<typeof getAlbum>>
): import("@mundial-album/shared").SettlementOptionDto[] {
  const catalog = new Map(
    [...fromAlbum.stickers, ...toAlbum.stickers].map((item) => [item.sticker.code, item.sticker])
  );

  return steps.map((step) => ({
    give: step.stickersGivenByMe[0] ? catalog.get(step.stickersGivenByMe[0]) ?? null : null,
    receive: step.stickersGivenByOther[0] ? catalog.get(step.stickersGivenByOther[0]) ?? null : null
  }));
}

function resolveProposalPending(
  comparison: Pick<ExchangeSnapshot, "type" | "pendingCountForMe" | "pendingCountForOther">,
  transferPlan: SettlementTransferPlan
): { pendingCountForMe: number; pendingCountForOther: number } {
  if (comparison.type === "PENDING") {
    return {
      pendingCountForMe: transferPlan.stickersGivenByMe.length,
      pendingCountForOther: 0
    };
  }

  return reducePendingCounts(
    comparison.pendingCountForMe,
    comparison.pendingCountForOther,
    transferPlan.settledCount
  );
}

export async function executeExchange(
  input: CreateExchangePayload
): Promise<ExecuteExchangeResultDto> {
  await assertDistinctUsers(input.fromUserId, input.toUserId);
  const selection = toSelection(input.stickersGivenByMe, input.stickersGivenByOther);

  if (input.custom && !selection) {
    throw new HttpError(400, "Indicá las figuritas del intercambio personalizado.");
  }

  const snapshot = input.custom
    ? await buildCustomExchangeSnapshot(
        input.fromUserId,
        input.toUserId,
        selection!,
        input.notes
      )
    : await buildExchangeSnapshot(input.fromUserId, input.toUserId, input.notes, selection);
  const settledPairs = Math.max(
    snapshot.stickersGivenByMe.length,
    snapshot.stickersGivenByOther.length
  );
  const nextPending = input.custom
    ? computeCustomPendingCounts(
        snapshot.stickersGivenByMe.length,
        snapshot.stickersGivenByOther.length
      )
    : { pendingCountForMe: 0, pendingCountForOther: 0 };
  const status =
    nextPending.pendingCountForMe > 0 || nextPending.pendingCountForOther > 0
      ? "PENDING_SETTLEMENT"
      : "COMPLETED";

  const proposal = await prisma.$transaction(async (tx) => {
    await closeOpenSettlementBetweenUsers(tx, input.fromUserId, input.toUserId);
    await applyExchangeTransfers(tx, input.fromUserId, input.toUserId, snapshot);

    return tx.exchangeProposal.create({
      data: {
        fromUserId: input.fromUserId,
        toUserId: input.toUserId,
        status,
        type: snapshot.type,
        stickersGivenByMe: snapshot.stickersGivenByMe,
        stickersGivenByOther: snapshot.stickersGivenByOther,
        pendingCountForMe: nextPending.pendingCountForMe,
        pendingCountForOther: nextPending.pendingCountForOther,
        notes: snapshot.notes
      }
    });
  });

  const [fromUserSummary, toUserSummary] = await Promise.all([
    getAlbumSummary(input.fromUserId),
    getAlbumSummary(input.toUserId)
  ]);

  return {
    proposal: toExchangeProposalDto(proposal),
    fromUserSummary,
    toUserSummary,
    message: buildExecuteMessage(nextPending, settledPairs)
  };
}

async function buildPendingSettlementDto(
  proposal: ExchangeProposal & { fromUser: User; toUser: User },
  viewerUserId: string
): Promise<PendingSettlementDto> {
  const otherUser = proposal.fromUserId === viewerUserId ? proposal.toUser : proposal.fromUser;
  const { owedToMe, owedByMe } = getPendingCountsForViewer(proposal, viewerUserId);
  const [fromAlbum, toAlbum] = await Promise.all([
    getAlbum(proposal.fromUserId),
    getAlbum(proposal.toUserId)
  ]);
  const comparison = buildCompareAlbumDto(fromAlbum, toAlbum);
  const steps = buildSettlementSteps(
    comparison.canGive.map((sticker) => sticker.code),
    comparison.canReceive.map((sticker) => sticker.code),
    proposal.pendingCountForMe,
    proposal.pendingCountForOther
  );
  const options = mapStepsToSettlementOptions(steps, fromAlbum, toAlbum);

  return {
    proposal: toExchangeProposalDto(proposal),
    otherUser: toUserDto(otherUser),
    owedToMe,
    owedByMe,
    canFinalizeNow: options.length > 0,
    message: buildPendingSettlementMessage(otherUser.name, owedToMe, owedByMe),
    options
  };
}

export async function listPendingSettlements(userId: string): Promise<PendingSettlementDto[]> {
  const proposals = await prisma.exchangeProposal.findMany({
    where: {
      status: "PENDING_SETTLEMENT",
      OR: [{ fromUserId: userId }, { toUserId: userId }]
    },
    include: {
      fromUser: true,
      toUser: true
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  return Promise.all(proposals.map((proposal) => buildPendingSettlementDto(proposal, userId)));
}

export async function finalizeExchange(
  proposalId: string,
  userId: string,
  stickersGivenByMe?: string[],
  stickersGivenByOther?: string[]
): Promise<ExecuteExchangeResultDto> {
  const existing = await prisma.exchangeProposal.findUnique({
    where: { id: proposalId },
    include: {
      fromUser: true,
      toUser: true
    }
  });

  if (!existing) {
    throw new HttpError(404, "Intercambio no encontrado.");
  }

  if (existing.status !== "PENDING_SETTLEMENT") {
    throw new HttpError(409, "Este intercambio ya no tiene saldo pendiente.");
  }

  if (existing.fromUserId !== userId && existing.toUserId !== userId) {
    throw new HttpError(403, "No podés finalizar un intercambio ajeno.");
  }

  const comparison = buildCompareAlbumDto(
    await getAlbum(existing.fromUserId),
    await getAlbum(existing.toUserId)
  );
  const selection = toSelection(stickersGivenByMe, stickersGivenByOther);
  const settlementPlan = validateAndBuildFinalizeSelection(
    selection,
    comparison.canGive.map((sticker) => sticker.code),
    comparison.canReceive.map((sticker) => sticker.code),
    existing.pendingCountForMe,
    existing.pendingCountForOther
  );

  if (settlementPlan.settledCount === 0) {
    throw new HttpError(
      409,
      "Todavía no hay figuritas disponibles para saldar el pendiente. Actualizá los álbumes e intentá de nuevo."
    );
  }

  const settleCount = settlementPlan.settledCount;
  const snapshot: ExchangeSnapshot = {
    stickersGivenByMe: settlementPlan.stickersGivenByMe,
    stickersGivenByOther: settlementPlan.stickersGivenByOther,
    pendingCountForMe: existing.pendingCountForMe,
    pendingCountForOther: existing.pendingCountForOther,
    type: comparison.type,
    notes: existing.notes ?? comparison.message
  };
  const nextPending = reducePendingCounts(
    existing.pendingCountForMe,
    existing.pendingCountForOther,
    settleCount
  );
  const completed = nextPending.pendingCountForMe === 0 && nextPending.pendingCountForOther === 0;

  const proposal = await prisma.$transaction(async (tx) => {
    await applyExchangeTransfers(tx, existing.fromUserId, existing.toUserId, snapshot);

    return tx.exchangeProposal.update({
      where: { id: existing.id },
      data: {
        status: completed ? "COMPLETED" : "PENDING_SETTLEMENT",
        stickersGivenByMe: [...existing.stickersGivenByMe, ...snapshot.stickersGivenByMe],
        stickersGivenByOther: [...existing.stickersGivenByOther, ...snapshot.stickersGivenByOther],
        pendingCountForMe: nextPending.pendingCountForMe,
        pendingCountForOther: nextPending.pendingCountForOther
      }
    });
  });

  const [fromUserSummary, toUserSummary] = await Promise.all([
    getAlbumSummary(existing.fromUserId),
    getAlbumSummary(existing.toUserId)
  ]);

  return {
    proposal: toExchangeProposalDto(proposal),
    fromUserSummary,
    toUserSummary,
    message: buildFinalizeMessage(settleCount, completed)
  };
}

function toExchangeProposalDto(proposal: ExchangeProposal): ExchangeProposalDto {
  return {
    id: proposal.id,
    fromUserId: proposal.fromUserId,
    toUserId: proposal.toUserId,
    status: proposal.status,
    type: proposal.type,
    stickersGivenByMe: proposal.stickersGivenByMe,
    stickersGivenByOther: proposal.stickersGivenByOther,
    pendingCountForMe: proposal.pendingCountForMe,
    pendingCountForOther: proposal.pendingCountForOther,
    notes: proposal.notes,
    createdAt: proposal.createdAt.toISOString(),
    updatedAt: proposal.updatedAt.toISOString()
  };
}
