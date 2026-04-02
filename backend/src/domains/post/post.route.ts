import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import {
  createPostSchema,
  deletePostParamsSchema,
  editPostSchema,
  getPostsByUserIdParamsSchema,
  getPostsSchema,
} from "./post.schema.js";
import { PostError, PostService } from "./post.service.js";

const posts = new Hono<AppBindings>();
const postService = new PostService();

const parsePostsInput = (input: unknown) => getPostsSchema.safeParse(input);

posts.get("/", async (c) => {
  const parsed = parsePostsInput(c.req.query());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await postService.getPosts(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get posts" }, 500);
  }
});

posts.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = parsePostsInput(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await postService.getPosts(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get posts" }, 500);
  }
});

posts.get("/:userId/posts", async (c) => {
  const parsed = getPostsByUserIdParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await postService.getPostsByUserId(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get posts" }, 500);
  }
});

posts.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createPostSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    const result = await postService.createPost(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create post" }, 500);
  }
});

posts.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editPostSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await postService.editPost(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof PostError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to update post" }, 500);
  }
});

posts.delete("/delete/:postId", async (c) => {
  const parsed = deletePostParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await postService.deletePost(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof PostError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to delete post" }, 500);
  }
});

export { posts };
