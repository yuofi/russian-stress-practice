import { z } from "zod";
import zEnvNonemptyTrimmed, {zEnvHost} from '@russian-stress-practice/shared/src/zod'
 
export const zEnv = z.object({
  VITE_BACKEND_TRPC_URL: zEnvNonemptyTrimmed,
  VITE_WEBAPP_URL: zEnvNonemptyTrimmed,
  HOST_ENV: zEnvHost,
  VITE_GOOGLE_CLIENT_ID: zEnvNonemptyTrimmed,
  VITE_GOOGLE_REDIRECT_URI: zEnvNonemptyTrimmed,
  NODE_ENV: z.enum(["development", "production"]),
  VITE_PORT: zEnvNonemptyTrimmed
});

// eslint-disable-next-line no-restricted-syntax
export const env = zEnv.parse(process.env);
