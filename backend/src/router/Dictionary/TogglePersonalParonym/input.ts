import { z } from "zod";

export const zTogglePersonalParonym = z.object({
  paronymPairId: z.number(),
  isPersonal: z.boolean(),
});