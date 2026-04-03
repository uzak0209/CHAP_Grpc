import { Pool } from "pg";

import { getEnv } from "../config/env.js";

const pools = new Map<string, Pool>();

export const getDb = () => {
  const { DB_DSN } = getEnv();
  const existing = pools.get(DB_DSN);
  if (existing) {
    return existing;
  }

  const pool = new Pool({
    connectionString: DB_DSN,
  });

  pools.set(DB_DSN, pool);

  return pool;
};
