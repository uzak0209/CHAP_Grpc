import { Hono } from "hono";

import { AuthError, AuthService } from "./auth.service.js";
import { signInSchema, signUpSchema } from "./auth.schema.js";

const auth = new Hono();
const authService = new AuthService();

auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const parsed = signUpSchema.safeParse(body);

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
    const result = await authService.signUp(parsed.data);
    return c.json(result, 201);
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "internal server error" }, 500);
  }
});

auth.post("/signin", async (c) => {
  const body = await c.req.json();
  const parsed = signInSchema.safeParse(body);

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
    const result = await authService.signIn(parsed.data);
    return c.json(result, 200);
  } catch (error) {
    if (error instanceof AuthError) {
      return c.json({ success: false, message: error.message }, error.status);
    }

    console.error(error);
    return c.json({ success: false, message: "internal server error" }, 500);
  }
});

export { auth };
