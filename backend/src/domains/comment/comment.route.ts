import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import {
  createCommentSchema,
  deleteCommentParamsSchema,
  editCommentSchema,
  getCommentsByThreadIdParamsSchema,
} from "./comment.schema.js";
import { CommentError, CommentService } from "./comment.service.js";

const comments = new Hono<AppBindings>();
const commentService = new CommentService();

comments.get("/:threadId", async (c) => {
  const parsed = getCommentsByThreadIdParamsSchema.safeParse(c.req.param());
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
    const result = await commentService.getCommentsByThreadId(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get comments" }, 500);
  }
});

comments.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createCommentSchema.safeParse(body);

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
    const result = await commentService.createComment(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create comment" }, 500);
  }
});

comments.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editCommentSchema.safeParse(body);

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
    const result = await commentService.editComment(c.get("userId"), parsed.data);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof CommentError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to update comment" }, 500);
  }
});

comments.delete("/delete/:commentId", async (c) => {
  const parsed = deleteCommentParamsSchema.safeParse(c.req.param());

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
    const result = await commentService.deleteComment(c.get("userId"), parsed.data);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof CommentError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to delete comment" }, 500);
  }
});

export { comments };
