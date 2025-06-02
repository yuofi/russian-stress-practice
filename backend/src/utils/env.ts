/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import {zEnvNonemptyTrimmed} from '@russian-stress-practice/shared/src/zod'
import * as dotenv from "dotenv";
import { z } from "zod";

const findFileDeep = (startDir: string, targetFilename: string): string | null => {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isFile() && entry.name === targetFilename) {
      return fullPath;
    } else if (entry.isDirectory()) {
      const found = findFileDeep(fullPath, targetFilename);
      if (found) return found;
    }
  }

  return null;
};


const splitted = process.cwd().split('\\')
// console.log(splitted[splitted.length - 3])

if (splitted[splitted.length - 3] == 'web') {
  dotenv.config()
} else {  
  dotenv.config({ path: path.resolve(process.cwd(), 'backend', '.env') })
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