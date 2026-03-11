import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DB_DSN: z.string().min(1, "DB_DSN is required"),
  JWT_SECRET: z.string().default("default-jwt-secret-change-in-production"),
  PORT: z.coerce.number().int().positive().default(8081),
});

export const env = envSchema.parse(process.env);
