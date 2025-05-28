import fs from 'fs';
import path from 'path';
import {zEnvNonemptyTrimmed} from '@russian-stress-practice/shared/src/zod'
import * as dotenv from "dotenv";
import { z } from "zod";

const findEnvFilePath = (dir: string): string | null => {
  const maybeEnvFilePath = path.join(dir, '.env')
  if (fs.existsSync(maybeEnvFilePath)) {
    return maybeEnvFilePath
  }
  if (dir === '/') {
    return null
  }
  return findEnvFilePath(path.dirname(dir))
}

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '/etc/secrets/.backend.env' });
} else {
  const envFilePath = findEnvFilePath(__dirname);
  if (envFilePath) {
    dotenv.config({ path: envFilePath });
    dotenv.config({ path: `${envFilePath}.${process.env.NODE_ENV}` });
  }
}

const zEnv = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().min(1),
  HOST_ENV: z.enum(['local', 'production']).default('local'),
  DEBUG: z
  .string()
  .optional()
  .refine(
    (val) => process.env.HOST_ENV === 'local' || process.env.NODE_ENV !== 'production' || (!!val && val.length > 0),
    'Required on not local host on production'
  ),
  FRONTEND_URL: zEnvNonemptyTrimmed,
  JWT_SECRET: zEnvNonemptyTrimmed
});

export const env = zEnv.parse(process.env);