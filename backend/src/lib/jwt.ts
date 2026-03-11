import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export const signUserToken = (userId: string) =>
  jwt.sign({ user_id: userId }, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: ONE_WEEK_IN_SECONDS,
  });
