import { Hono } from "hono";

import { comments } from "./domains/comment/comment.route.js";
import { auth } from "./domains/auth/auth.route.js";
import { authMiddleware } from "./middleware/auth.js";
import type { AppBindings } from "./types/hono.js";

export const app = new Hono<AppBindings>();

app.use("*", authMiddleware);

app.get("/health", (c) =>
  c.json({
    ok: true,
  }),
);

app.route("/api/v1/auth", auth);
app.route("/api/v1/comments", comments);
