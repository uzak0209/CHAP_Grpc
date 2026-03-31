import { z } from "zod";

export const getPostsQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
});

export const createPostSchema = z.object({
  content: z.string().min(1),
  image: z.string().optional().default(""),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  content_type: z.string().optional().default(""),
});

export type GetPostsQuery = z.infer<typeof getPostsQuerySchema>;
export type CreatePostInput = z.infer<typeof createPostSchema>;
