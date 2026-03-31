import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import { createEventSchema, getEventByIdParamsSchema, getEventsQuerySchema } from "./event.schema.js";
import { EventError, EventService } from "./event.service.js";

const events = new Hono<AppBindings>();
const eventService = new EventService();

events.get("/", async (c) => {
  const parsed = getEventsQuerySchema.safeParse(c.req.query());
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
    const result = await eventService.getEvents(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get events" }, 500);
  }
});

events.get("/:eventId", async (c) => {
  const parsed = getEventByIdParamsSchema.safeParse(c.req.param());
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
    const result = await eventService.getEventById(parsed.data);
    return c.json(result, 200);
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
    return c.json(
      {
        success: false,
        message: parsed.error.issues[0]?.message ?? "invalid request",
      },
      400,
    );
  }

  try {
    const result = await eventService.createEvent(c.get("userId"), parsed.data);
    return c.json(result, result.success ? 200 : 500);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create event" }, 500);
  }
});

export { events };
