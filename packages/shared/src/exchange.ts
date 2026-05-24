export const EXCHANGE_TYPES = [
  "DIRECT",
  "MULTIPLE",
  "PARTIAL",
  "PENDING",
  "INFO_INSUFFICIENT",
  "NOT_AVAILABLE"
] as const;

export type ExchangeType = (typeof EXCHANGE_TYPES)[number];

export const EXCHANGE_STATUSES = [
  "DRAFT",
  "PROPOSED",
  "ACCEPTED",
  "PENDING_SETTLEMENT",
  "COMPLETED",
  "CANCELLED"
] as const;

export type ExchangeStatus = (typeof EXCHANGE_STATUSES)[number];

export interface ExchangeAnalysisDto {
  type: ExchangeType;
  canGive: string[];
  canReceive: string[];
  pendingCountForMe: number;
  pendingCountForOther: number;
  message: string;
}

export interface CreateExchangePayload {
  fromUserId: string;
  toUserId: string;
  status?: ExchangeStatus;
  notes?: string;
  stickersGivenByMe?: string[];
  stickersGivenByOther?: string[];
  custom?: boolean;
}

export interface FinalizeExchangePayload {
  userId: string;
  stickersGivenByMe?: string[];
  stickersGivenByOther?: string[];
}

export interface SettlementOptionDto {
  give: import("./index.js").StickerDto | null;
  receive: import("./index.js").StickerDto | null;
}

export interface ExchangeProposalDto {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: ExchangeStatus;
  type: ExchangeType;
  stickersGivenByMe: string[];
  stickersGivenByOther: string[];
  pendingCountForMe: number;
  pendingCountForOther: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendingSettlementDto {
  proposal: ExchangeProposalDto;
  otherUser: import("./index.js").UserDto;
  owedToMe: number;
  owedByMe: number;
  canFinalizeNow: boolean;
  message: string;
  options: SettlementOptionDto[];
}

export const EXCHANGE_TYPE_LABELS: Record<ExchangeType, string> = {
  DIRECT: "Intercambio directo",
  MULTIPLE: "Intercambio múltiple",
  PARTIAL: "Intercambio parcial",
  PENDING: "Intercambio parcial",
  INFO_INSUFFICIENT: "Información insuficiente",
  NOT_AVAILABLE: "Sin coincidencias"
};

export const EXCHANGE_STATUS_LABELS: Record<ExchangeStatus, string> = {
  DRAFT: "Borrador",
  PROPOSED: "Propuesto",
  ACCEPTED: "Aceptado",
  PENDING_SETTLEMENT: "Pendiente de saldo",
  COMPLETED: "Completado",
  CANCELLED: "Cancelado"
};
