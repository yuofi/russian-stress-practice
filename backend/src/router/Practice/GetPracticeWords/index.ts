import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zGetPracticeWords } from "./input";

export const GetPracticeWordsTrpcRoute = trpcLoggedProcedure
    .input(zGetPracticeWords)
    .query(async ({ ctx, input }) => {
        const words = await ctx.prisma.word.findMany({
            where: {
                type: input.type
            },
            select: {
                id: true,
                word: true,
                stress: true,
                practices: {
                    where: {
                        userId: ctx.me?.id
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 10
                }
            }
        });
        
        return {
            words: words.map(word => ({
                id: word.id,
                word: word.word,
                accentIdx: word.stress,
                history: word.practices.map(practice => ({
                    correct: practice.correct,
                    date: practice.createdAt
                }))
            }))
        };
    });
