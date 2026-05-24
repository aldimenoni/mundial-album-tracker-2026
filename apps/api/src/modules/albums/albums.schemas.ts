import { ALBUM_STATUSES } from "@mundial-album/shared";
import { z } from "zod";

export const userIdParamSchema = z.object({
  userId: z.string().uuid()
});

export const updateStickerParamsSchema = z.object({
  userId: z.string().uuid(),
  stickerId: z.string().uuid()
});

export const compareAlbumsParamsSchema = z.object({
  myUserId: z.string().uuid(),
  otherUserId: z.string().uuid()
});

export const updateUserStickerSchema = z
  .object({
    status: z.enum(ALBUM_STATUSES).optional(),
    quantityOwned: z.number().int().min(0).optional(),
    quantityRepeated: z.number().int().min(0).optional()
  })
  .strict()
  .refine(
    (value) =>
      value.status !== undefined ||
      value.quantityOwned !== undefined ||
      value.quantityRepeated !== undefined,
    "At least one field must be provided"
  );

export type UpdateUserStickerInput = z.infer<typeof updateUserStickerSchema>;
