import { sign } from "hono/jwt";

import { getEnv } from "../config/env.js";

const ONE_WEEK_IN_SECONDS = 60 * 60 * 24 * 7;

export const signUserToken = async (userId: string) =>
  sign(
    {
      user_id: userId,
      exp: Math.floor(Date.now() / 1000) + ONE_WEEK_IN_SECONDS,
    },
    getEnv().JWT_SECRET,
    "HS256",
  );
