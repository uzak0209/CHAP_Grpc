import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import { createThreadSchema, getThreadByIdParamsSchema, getThreadsQuerySchema } from "./thread.schema.js";
import { ThreadError, ThreadService } from "./thread.service.js";

const threads = new Hono<AppBindings>();
const threadService = new ThreadService();

threads.get("/", async (c) => {
  const parsed = getThreadsQuerySchema.safeParse(c.req.query());
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
    const result = await threadService.getThreads(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get threads" }, 500);
  }
});

threads.get("/:threadId", async (c) => {
  const parsed = getThreadByIdParamsSchema.safeParse(c.req.param());
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
    const result = await threadService.getThreadById(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof ThreadError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to get thread" }, 500);
  }
});

threads.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createThreadSchema.safeParse(body);

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
    const result = await threadService.createThread(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create thread" }, 500);
  }
});

export { threads };
