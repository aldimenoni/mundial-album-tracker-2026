import { z } from "zod";

export const listStickersQuerySchema = z.object({
  team: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().min(1).optional()
  )
});

export type ListStickersQuery = z.infer<typeof listStickersQuerySchema>;

export const stickerCodeParamSchema = z.object({
  code: z.string().trim().min(1).transform((value) => value.toUpperCase())
});

export type StickerCodeParam = z.infer<typeof stickerCodeParamSchema>;

export const missingUsersQuerySchema = z.object({
  viewerUserId: z.string().uuid().optional()
});

export type MissingUsersQuery = z.infer<typeof missingUsersQuerySchema>;
