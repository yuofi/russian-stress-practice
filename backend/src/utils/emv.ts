import fs from 'fs';
import path from 'path';
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

const envFilePath = findEnvFilePath(__dirname)
if (envFilePath) {
  dotenv.config({ path: envFilePath })
  dotenv.config({ path: `${envFilePath}.${process.env.NODE_ENV}` })
}

const zEnv = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string().transform(Number),
  DATABASE_URL: z.string().min(1),
  HOST_ENV: z.enum(['local', 'production']).default('local'),
});

export const env = zEnv.parse(process.env);