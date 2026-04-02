import { Hono } from "hono";

import { ImageError, ImageService } from "./image.service.js";
import { uploadImageSchema } from "./image.schema.js";

const images = new Hono();
const imageService = new ImageService();

images.post("/upload", async (c) => {
  const body = await c.req.json();
  const parsed = uploadImageSchema.safeParse(body);

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
    return c.json(await imageService.uploadImage(parsed.data), 200);
  } catch (error) {
    if (error instanceof ImageError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to upload image" }, 500);
  }
});

export { images };
