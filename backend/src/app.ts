import { Hono } from "hono";

import { comments } from "./domains/comment/comment.route.js";
import { auth } from "./domains/auth/auth.route.js";
import { events } from "./domains/event/event.route.js";
import { posts } from "./domains/post/post.route.js";
import { spots } from "./domains/spot/spot.route.js";
import { threads } from "./domains/thread/thread.route.js";
import { users } from "./domains/user/user.route.js";
import { images } from "./domains/image/image.route.js";
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
app.route("/api/v1/events", events);
app.route("/api/v1/posts", posts);
app.route("/api/v1/spots", spots);
app.route("/api/v1/threads", threads);
app.route("/api/v1/users", users);
app.route("/api/v1/images", images);
