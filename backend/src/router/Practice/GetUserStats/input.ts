import { z } from "zod";

export const zGetUserStats = z.object({
  type: z.enum(["STRESS", "PARONYM"]),
  period: z.number().optional(), // период в днях (7, 30, etc.)
});
