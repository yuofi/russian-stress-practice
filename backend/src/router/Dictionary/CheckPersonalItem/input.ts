import { z } from "zod";

export const zCheckPersonalItem = z.object({
  type: z.enum(["STRESS", "PARONYM"]),
  id: z.number(),
});