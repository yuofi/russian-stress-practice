import {z} from "zod"

export const zRecordPractice = z.object({
  // Общие поля
  correct: z.boolean(),
  
  wordId: z.number().optional(),
  
  paronymPairId: z.number().optional(),
  selectedWordId: z.number().optional(),
  correctWordId: z.number().optional(),
  
  type: z.enum(["STRESS", "PARONYM"]).optional(),
});