import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import {
  createThreadSchema,
  deleteThreadParamsSchema,
  editThreadSchema,
  getThreadByIdParamsSchema,
  getThreadsSchema,
} from "./thread.schema.js";
import { ThreadError, ThreadService } from "./thread.service.js";

const threads = new Hono<AppBindings>();
const threadService = new ThreadService();

const parseThreadsInput = (input: unknown) => getThreadsSchema.safeParse(input);

threads.get("/", async (c) => {
  const parsed = parseThreadsInput(c.req.query());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await threadService.getThreads(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get threads" }, 500);
  }
});

threads.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = parseThreadsInput(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await threadService.getThreads(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get threads" }, 500);
  }
});

threads.get("/:threadId", async (c) => {
  const parsed = getThreadByIdParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await threadService.getThreadById(parsed.data), 200);
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
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    const result = await threadService.createThread(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create thread" }, 500);
  }
});

threads.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editThreadSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await threadService.editThread(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof ThreadError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to update thread" }, 500);
  }
});

threads.delete("/delete/:threadId", async (c) => {
  const parsed = deleteThreadParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await threadService.deleteThread(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof ThreadError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to delete thread" }, 500);
  }
});

export { threads };
