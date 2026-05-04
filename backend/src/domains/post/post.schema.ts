import { z } from "zod";

export const getPostsSchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const getPostsByUserIdParamsSchema = z.object({
  userId: z.string().min(1),
});

export const createPostSchema = z.object({
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

export const editPostSchema = z.object({
  post_id: z.string().min(1),
  content: z.string().min(1),
  image: z.string().optional().default(""),
});

export const deletePostParamsSchema = z.object({
  postId: z.string().min(1),
});

export type GetPostsInput = z.infer<typeof getPostsSchema>;
export type GetPostsByUserIdParams = z.infer<typeof getPostsByUserIdParamsSchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
export type EditPostInput = z.infer<typeof editPostSchema>;
export type DeletePostParams = z.infer<typeof deletePostParamsSchema>;
