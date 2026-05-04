import { createMiddleware } from "hono/factory";

import { initializeEnv } from "../config/env.js";
import type { AppBindings } from "../types/hono.js";

export const runtimeEnvMiddleware = createMiddleware<AppBindings>(async (c, next) => {
  c.set("env", initializeEnv(c.env));
  await next();
});
