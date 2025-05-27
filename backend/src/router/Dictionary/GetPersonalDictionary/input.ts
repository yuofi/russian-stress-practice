import { z } from "zod";

export const zGetPersonalDictionary = z.object({
  type: z.enum(["STRESS", "PARONYM"]),
});