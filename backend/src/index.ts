import { serve } from "@hono/node-server";

import { getEnv } from "./config/env.js";
import { app } from "./app.js";

serve(
  {
    fetch: app.fetch,
    port: getEnv().PORT,
  },
  (info) => {
    console.log(`Hono server listening on http://localhost:${info.port}`);
  },
);
