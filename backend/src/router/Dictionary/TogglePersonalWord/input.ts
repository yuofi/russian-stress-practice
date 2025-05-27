import { z } from "zod";

export const zTogglePersonalWord = z.object({
  wordId: z.number(),
  isPersonal: z.boolean(),
});