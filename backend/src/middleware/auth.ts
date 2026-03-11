import { createMiddleware } from "hono/factory";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import type { AppBindings } from "../types/hono.js";

const publicPaths = new Set([
  "/health",
  "/api/v1/auth/signin",
  "/api/v1/auth/signup",
]);

type JwtPayload = {
  user_id?: string;
};

export const authMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  if (publicPaths.has(c.req.path)) {
    await next();
    return;
  }

  const authorization = c.req.header("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return c.json({ success: false, message: "authentication required" }, 401);
  }

  const token = authorization.slice("Bearer ".length);

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload.user_id) {
      return c.json({ success: false, message: "authentication required" }, 401);
    }

    c.set("userId", payload.user_id);
    await next();
  } catch (error) {
    console.error(error);
    return c.json({ success: false, message: "authentication required" }, 401);
  }
});
