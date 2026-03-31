import { Hono } from "hono";

import type { AppBindings } from "../../types/hono.js";
import { editUserSchema, getUserByIdParamsSchema } from "./user.schema.js";
import { UserError, UserService } from "./user.service.js";

const users = new Hono<AppBindings>();
const userService = new UserService();

users.get("/me", async (c) => {
  try {
    const result = await userService.getMe(c.get("userId"));
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof UserError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to get me" }, 500);
  }
});

users.get("/:userId", async (c) => {
  const parsed = getUserByIdParamsSchema.safeParse(c.req.param());
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
    const result = await userService.getUser(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof UserError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "failed to get user" }, 500);
  }
});

users.put("/edit", async (c) => {
  const body = await c.req.json();
  const parsed = editUserSchema.safeParse(body);

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
    const result = await userService.editUser(c.get("userId"), parsed.data);
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to edit user" }, 500);
  }
});

users.delete("/delete", async (c) => {
  try {
    const result = await userService.deleteUser(c.get("userId"));
    return c.json(result, 200);
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "failed to delete user" }, 500);
  }
});

export { users };
