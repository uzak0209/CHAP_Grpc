import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import {
  createEventSchema,
  deleteEventParamsSchema,
  editEventSchema,
  getEventByIdParamsSchema,
  getEventsSchema,
} from "./event.schema.js";
import { EventError, EventService } from "./event.service.js";

const events = new Hono<AppBindings>();
const eventService = new EventService();

const parseEventsInput = (input: unknown) => getEventsSchema.safeParse(input);

events.get("/", async (c) => {
  const parsed = parseEventsInput(c.req.query());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await eventService.getEvents(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get events" }, 500);
  }
});

events.post("/", async (c) => {
  const body = await c.req.json();
  const parsed = parseEventsInput(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await eventService.getEvents(parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get events" }, 500);
  }
});

events.get("/:eventId", async (c) => {
  const parsed = getEventByIdParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await eventService.getEventById(parsed.data), 200);
  } catch (error) {
    if (error instanceof EventError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to get event" }, 500);
  }
});

events.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    const result = await eventService.createEvent(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create event" }, 500);
  }
});

events.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editEventSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await eventService.editEvent(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof EventError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to update event" }, 500);
  }
});

events.delete("/delete/:eventId", async (c) => {
  const parsed = deleteEventParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await eventService.deleteEvent(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof EventError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to delete event" }, 500);
  }
});

export { events };
