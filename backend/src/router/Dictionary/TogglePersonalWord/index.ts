import { TRPCError } from "@trpc/server";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zTogglePersonalWord } from "./input";

export const TogglePersonalWordTrpcRoute = trpcLoggedProcedure
  .input(zTogglePersonalWord)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }

    const { wordId, isPersonal } = input;

    // Проверяем существование слова
    const word = await ctx.prisma.word.findUnique({
      where: { id: wordId },
    });

    if (!word) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Слово не найдено",
      });
    }

    // Проверяем, есть ли уже это слово в личном словарике
    const existingEntry = await ctx.prisma.personalWord.findUnique({
      where: {
        userId_wordId: {
          userId: ctx.me.id,
          wordId: wordId,
        },
      },
    });

    if (isPersonal) {
      // Если нужно добавить в словарик и записи еще нет
      if (!existingEntry) {
        await ctx.prisma.personalWord.create({
          data: {
            userId: ctx.me.id,
            wordId: wordId,
          },
        });
      }
    } else {
      // Если нужно удалить из словарика и запись существует
      if (existingEntry) {
        await ctx.prisma.personalWord.delete({
          where: {
            id: existingEntry.id,
          },
        });
      }
    }

    return { success: true, word };
  });