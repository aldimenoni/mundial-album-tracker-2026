import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nickname debe tener al menos 2 caracteres")
    .max(30, "El nickname no puede superar 30 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guión bajo")
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
