import type { RuntimeEnv, RuntimeEnvSource } from "../config/env.js";

export type AppBindings = {
  Bindings: RuntimeEnvSource;
  Variables: {
    env: RuntimeEnv;
    userId: string;
  };
};
