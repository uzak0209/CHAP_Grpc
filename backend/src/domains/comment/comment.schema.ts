import { z } from "zod";

export const getCommentsByThreadIdParamsSchema = z.object({
  threadId: z.uuid(),
});

export const createCommentSchema = z.object({
  thread_id: z.uuid(),
  content: z.string().trim().min(1),
});

export const editCommentSchema = z.object({
  comment_id: z.uuid(),
  content: z.string().trim().min(1),
});

export const deleteCommentParamsSchema = z.object({
  commentId: z.uuid(),
});

export type GetCommentsByThreadIdParams = z.infer<
  typeof getCommentsByThreadIdParamsSchema
>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type EditCommentInput = z.infer<typeof editCommentSchema>;
export type DeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>;
