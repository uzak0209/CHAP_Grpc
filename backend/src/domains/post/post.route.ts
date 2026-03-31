import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import { createPostSchema, getPostsQuerySchema } from "./post.schema.js";
import { PostService } from "./post.service.js";

const posts = new Hono<AppBindings>();
const postService = new PostService();

posts.get("/", async (c) => {
  const parsed = getPostsQuerySchema.safeParse(c.req.query());
  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "invalid request",
      },
      400,
    );
  }

  try {
    const result = await postService.getPosts(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get posts" }, 500);
  }
});

posts.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createPostSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "invalid request",
      },
      400,
    );
  }

  try {
    const result = await postService.createPost(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create post" }, 500);
  }
});

export { posts };
