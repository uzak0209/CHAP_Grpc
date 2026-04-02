import { z } from "zod";

export const getThreadsSchema = z.object({
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
  contentType: z.string().optional(),
  content_type: z.string().optional().default(""),
}).transform(({ contentType, content_type, ...rest }) => ({
  ...rest,
  content_type: content_type || contentType || "",
}));

export const editThreadSchema = z.object({
  thread_id: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional().default(""),
});

export const deleteThreadParamsSchema = z.object({
  threadId: z.string().min(1),
});

export type GetThreadsInput = z.infer<typeof getThreadsSchema>;
export type GetThreadByIdParams = z.infer<typeof getThreadByIdParamsSchema>;
export type CreateThreadInput = z.infer<typeof createThreadSchema>;
export type EditThreadInput = z.infer<typeof editThreadSchema>;
export type DeleteThreadParams = z.infer<typeof deleteThreadParamsSchema>;
