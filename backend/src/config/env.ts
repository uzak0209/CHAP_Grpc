import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  DB_DSN: z.string().min(1, "DB_DSN is required"),
  JWT_SECRET: z.string().default("default-jwt-secret-change-in-production"),
  PORT: z.coerce.number().int().positive().default(8083),
  R2_BUCKET_NAME: z.string().optional(),
  R2_ACCESS_KEY: z.string().optional(),
  R2_SECRET_KEY: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
});

export type RuntimeEnv = z.infer<typeof envSchema>;

export type RuntimeEnvSource = Partial<
  Record<keyof RuntimeEnv, string | number | undefined>
>;

let cachedEnv: RuntimeEnv | null = null;

export const setEnv = (source: RuntimeEnvSource): RuntimeEnv => {
  cachedEnv = envSchema.parse(source);
  return cachedEnv;
};

export const getEnv = (): RuntimeEnv => {
  if (cachedEnv) {
    return cachedEnv;
  }

  if (typeof process !== "undefined") {
    return setEnv(process.env);
  }

  throw new Error("runtime environment is not configured");
};

export const initializeEnv = (source?: RuntimeEnvSource): RuntimeEnv => {
  if (source && Object.keys(source).length > 0) {
    return setEnv(source);
  }

  return getEnv();
};
