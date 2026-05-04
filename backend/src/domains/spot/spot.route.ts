import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import { createSpotSchema, deleteSpotParamsSchema, editSpotSchema } from "./spot.schema.js";
import { SpotError, SpotService } from "./spot.service.js";

const spots = new Hono<AppBindings>();
const spotService = new SpotService();

spots.get("/", async (c) => {
  try {
    return c.json(await spotService.getSpots(c.get("userId")), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get spots" }, 500);
  }
});

spots.post("/", async (c) => {
  try {
    return c.json(await spotService.getSpots(c.get("userId")), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to get spots" }, 500);
  }
});

spots.post("/create", async (c) => {
  const body = await c.req.json();
  const parsed = createSpotSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await spotService.createSpot(c.get("userId"), parsed.data), 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to create spot" }, 500);
  }
});

spots.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editSpotSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await spotService.editSpot(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof SpotError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to update spot" }, 500);
  }
});

spots.delete("/delete/:spotId", async (c) => {
  const parsed = deleteSpotParamsSchema.safeParse(c.req.param());
  if (!parsed.success) {
    return c.json({ success: false, message: parsed.error.issues[0]?.message ?? "invalid request" }, 400);
  }

  try {
    return c.json(await spotService.deleteSpot(c.get("userId"), parsed.data), 200);
  } catch (error) {
    if (error instanceof SpotError) {
      return c.json({ success: false, message: error.message }, error.status);
    }
    console.error(error);
    return c.json({ success: false, message: "failed to delete spot" }, 500);
  }
});

export { spots };
