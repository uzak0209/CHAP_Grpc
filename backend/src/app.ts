import { Hono } from "hono";

import { auth } from "./domains/auth/auth.route.js";

export const app = new Hono();

app.get("/health", (c) =>
  c.json({
    ok: true,
  }),
);

app.route("/api/v1/auth", auth);
