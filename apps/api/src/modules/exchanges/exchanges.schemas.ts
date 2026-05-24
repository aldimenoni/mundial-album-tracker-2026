import { z } from "zod";
import { EXCHANGE_STATUSES } from "@mundial-album/shared";

export const createExchangeSchema = z.object({
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  status: z.enum(EXCHANGE_STATUSES).optional(),
  notes: z.string().trim().max(500).optional(),
  stickersGivenByMe: z.array(z.string().trim().min(1)).optional(),
  stickersGivenByOther: z.array(z.string().trim().min(1)).optional(),
  custom: z.boolean().optional()
});

export const finalizeExchangeSchema = z.object({
  userId: z.string().uuid(),
  stickersGivenByMe: z.array(z.string().trim().min(1)).optional(),
  stickersGivenByOther: z.array(z.string().trim().min(1)).optional()
});
