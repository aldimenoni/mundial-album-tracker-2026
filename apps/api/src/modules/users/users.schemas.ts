import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160)
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
