import { z } from "zod";
import { trpcLoggedProcedure } from "../../../lib/trpc";

export const zRecordPractice = z.object({
  wordId: z.number(),
  correct: z.boolean()
});

export const RecordPracticeTrpcRoute = trpcLoggedProcedure
  .input(zRecordPractice)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error("User not authenticated");
    }
    
    // Create a new practice record
    const practice = await ctx.prisma.practice.create({
      data: {
        userId: ctx.me.id,
        wordId: input.wordId,
        correct: input.correct
      }
    });
    
    return { success: true, practiceId: practice.id };
  });

