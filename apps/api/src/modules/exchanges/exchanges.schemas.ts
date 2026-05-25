import { z } from "zod";
import { EXCHANGE_STATUSES } from "@mundial-album/shared";

export const createExchangeSchema = z
  .object({
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
    status: z.enum(EXCHANGE_STATUSES).optional(),
    notes: z.string().trim().max(500).optional(),
    stickersGivenByMe: z.array(z.string().trim().min(1)).optional(),
    stickersGivenByOther: z.array(z.string().trim().min(1)).optional(),
    custom: z.boolean().optional()
  })
  .superRefine((value, context) => {
    if (value.custom) {
      return;
    }

    const giveCount = value.stickersGivenByMe?.length ?? 0;
    const receiveCount = value.stickersGivenByOther?.length ?? 0;

    if (giveCount === 0 && receiveCount === 0) {
      context.addIssue({
        code: "custom",
        message: "Indicá las figuritas del intercambio.",
        path: ["stickersGivenByMe"]
      });
      return;
    }

    if (giveCount !== receiveCount) {
      context.addIssue({
        code: "custom",
        message: "La cantidad de figuritas que das y que recibís debe coincidir.",
        path: ["stickersGivenByOther"]
      });
    }
  });

export const finalizeExchangeSchema = z.object({
  userId: z.string().uuid(),
  stickersGivenByMe: z.array(z.string().trim().min(1)).optional(),
  stickersGivenByOther: z.array(z.string().trim().min(1)).optional()
});
