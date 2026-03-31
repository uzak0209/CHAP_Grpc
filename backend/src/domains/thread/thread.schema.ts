import { z } from "zod";

export const getThreadsQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const getThreadByIdParamsSchema = z.object({
  threadId: z.string().min(1),
});

export const createThreadSchema = z.object({
  content: z.string().min(1),
  image: z.string().optional().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  content_type: z.string().optional().default(""),
});

export type GetThreadsQuery = z.infer<typeof getThreadsQuerySchema>;
export type GetThreadByIdParams = z.infer<typeof getThreadByIdParamsSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
