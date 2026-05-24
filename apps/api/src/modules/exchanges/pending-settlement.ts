import type { ExchangeProposalDto } from "@mundial-album/shared";

export type SettlementStep = {
  stickersGivenByMe: string[];
  stickersGivenByOther: string[];
};

export function getPendingCountsForViewer(
  proposal: Pick<ExchangeProposalDto, "fromUserId" | "pendingCountForMe" | "pendingCountForOther">,
  viewerUserId: string
): { owedToMe: number; owedByMe: number } {
  const isFromUser = proposal.fromUserId === viewerUserId;

  if (isFromUser) {
    return {
      owedToMe: proposal.pendingCountForMe,
      owedByMe: proposal.pendingCountForOther
    };
  }

  return {
    owedToMe: proposal.pendingCountForOther,
    owedByMe: proposal.pendingCountForMe
  };
}

export function buildPendingSettlementMessage(
  otherUserName: string,
  owedToMe: number,
  owedByMe: number
): string {
  if (owedByMe > 0 && owedToMe > 0) {
    return `Saldo cruzado con @${otherUserName}: debés ${owedByMe} y te deben ${owedToMe}.`;
  }

  if (owedByMe > 0) {
    return `Debés ${owedByMe} figurita${owedByMe === 1 ? "" : "s"} a @${otherUserName}.`;
  }

  if (owedToMe > 0) {
    return `@${otherUserName} te debe ${owedToMe} figurita${owedToMe === 1 ? "" : "s"}.`;
  }

  return "Sin pendientes.";
}

export type SettlementTransferPlan = SettlementStep & {
  settledCount: number;
};

export function buildSettlementSteps(
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number,
  maxSteps?: number
): SettlementStep[] {
  const steps: SettlementStep[] = [];
  const remGive = [...canGive];
  const remReceive = [...canReceive];
  let remPendingForMe = pendingCountForMe;
  let remPendingForOther = pendingCountForOther;
  const limit = maxSteps ?? Number.MAX_SAFE_INTEGER;

  while (
    steps.length < limit &&
    (remPendingForMe > 0 || remPendingForOther > 0) &&
    (remGive.length > 0 || remReceive.length > 0)
  ) {
    if (remGive.length > 0 && remReceive.length > 0) {
      steps.push({
        stickersGivenByMe: [remGive.shift()!],
        stickersGivenByOther: [remReceive.shift()!]
      });

      if (remPendingForMe > 0) {
        remPendingForMe -= 1;
      } else if (remPendingForOther > 0) {
        remPendingForOther -= 1;
      }

      continue;
    }

    if (remReceive.length > 0 && remPendingForMe > 0) {
      steps.push({
        stickersGivenByMe: [],
        stickersGivenByOther: [remReceive.shift()!]
      });
      remPendingForMe -= 1;
      continue;
    }

    if (remGive.length > 0 && remPendingForOther > 0) {
      steps.push({
        stickersGivenByMe: [remGive.shift()!],
        stickersGivenByOther: []
      });
      remPendingForOther -= 1;
      continue;
    }

    if (remReceive.length > 0 && remPendingForOther > 0 && remGive.length === 0) {
      steps.push({
        stickersGivenByMe: [],
        stickersGivenByOther: [remReceive.shift()!]
      });
      remPendingForOther -= 1;
      continue;
    }

    if (remGive.length > 0 && remPendingForMe > 0 && remReceive.length === 0) {
      steps.push({
        stickersGivenByMe: [remGive.shift()!],
        stickersGivenByOther: []
      });
      remPendingForMe -= 1;
      continue;
    }

    break;
  }

  return steps;
}

export function buildSettlementTransferPlan(
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number,
  maxSettle?: number
): SettlementTransferPlan {
  const steps = buildSettlementSteps(
    canGive,
    canReceive,
    pendingCountForMe,
    pendingCountForOther,
    maxSettle
  );

  return {
    stickersGivenByMe: steps.flatMap((step) => step.stickersGivenByMe),
    stickersGivenByOther: steps.flatMap((step) => step.stickersGivenByOther),
    settledCount: steps.length
  };
}

export function computeSettlementCount(
  canGiveCount: number,
  canReceiveCount: number,
  pendingCountForMe: number,
  pendingCountForOther: number
): number {
  return buildSettlementTransferPlan(
    Array.from({ length: canGiveCount }, (_, index) => `give-${index}`),
    Array.from({ length: canReceiveCount }, (_, index) => `receive-${index}`),
    pendingCountForMe,
    pendingCountForOther
  ).settledCount;
}

export function mergeSettlementSteps(steps: SettlementStep[]): SettlementStep {
  return {
    stickersGivenByMe: steps.flatMap((step) => step.stickersGivenByMe),
    stickersGivenByOther: steps.flatMap((step) => step.stickersGivenByOther)
  };
}

export function isValidSettlementStep(
  step: SettlementStep,
  canGive: string[],
  canReceive: string[],
  pendingCountForMe: number,
  pendingCountForOther: number
): boolean {
  const availableSteps = buildSettlementSteps(
    canGive,
    canReceive,
    pendingCountForMe,
    pendingCountForOther
  );

  return availableSteps.some(
    (candidate) =>
      candidate.stickersGivenByMe.join("|") === step.stickersGivenByMe.join("|") &&
      candidate.stickersGivenByOther.join("|") === step.stickersGivenByOther.join("|")
  );
}

export function reducePendingCounts(
  pendingCountForMe: number,
  pendingCountForOther: number,
  settledPairs: number
): { pendingCountForMe: number; pendingCountForOther: number } {
  let remaining = settledPairs;
  let nextPendingForMe = pendingCountForMe;
  let nextPendingForOther = pendingCountForOther;

  while (remaining > 0 && (nextPendingForMe > 0 || nextPendingForOther > 0)) {
    if (nextPendingForMe > 0) {
      nextPendingForMe -= 1;
    } else if (nextPendingForOther > 0) {
      nextPendingForOther -= 1;
    }

    remaining -= 1;
  }

  return {
    pendingCountForMe: nextPendingForMe,
    pendingCountForOther: nextPendingForOther
  };
}
