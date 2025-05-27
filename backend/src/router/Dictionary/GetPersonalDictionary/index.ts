import { TRPCError } from "@trpc/server";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zGetPersonalDictionary } from "./input";

export const GetPersonalDictionaryTrpcRoute = trpcLoggedProcedure
  .input(zGetPersonalDictionary)
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }

    const { type } = input;

    if (type === "STRESS") {
      // Получаем слова с ударениями из личного словарика
      const personalWords = await ctx.prisma.personalWord.findMany({
        where: {
          userId: ctx.me.id,
          word: {
            type: "STRESS",
          },
        },
        include: {
          word: {
            include: {
              practices: {
                where: {
                  userId: ctx.me.id,
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
        },
      });

      return {
        words: personalWords.map((entry) => ({
          id: entry.word.id,
          word: entry.word.word,
          accentIdx: entry.word.stress,
          history: entry.word.practices.map((practice) => ({
            correct: practice.correct,
            date: practice.createdAt,
          })),
        })),
      };
    } else if (type === "PARONYM") {
      // Получаем пары паронимов из личного словарика
      const personalParonyms = await ctx.prisma.personalParonym.findMany({
        where: {
          userId: ctx.me.id,
        },
        include: {
          paronymPair: {
            include: {
              words: true,
            },
          },
        },
      });

      return {
        paronyms: personalParonyms.map((entry) => ({
          id: entry.paronymPair.id,
          group: entry.paronymPair.words.map((word) => word.word),
          paronyms: entry.paronymPair.words.map((word) => ({
            id: word.id,
            word: word.word,
            explanation: word.description || "",
          })),
        })),
      };
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Неподдерживаемый тип словарика",
    });
  });