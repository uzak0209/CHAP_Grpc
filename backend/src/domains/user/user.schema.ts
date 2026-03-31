import { z } from "zod";

export const getUserByIdParamsSchema = z.object({
  userId: z.string().min(1),
});

export const editUserSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
});

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;
export type EditUserInput = z.infer<typeof editUserSchema>;
