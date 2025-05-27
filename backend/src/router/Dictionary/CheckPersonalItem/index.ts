import { TRPCError } from "@trpc/server";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zCheckPersonalItem } from "./input";

export const CheckPersonalItemTrpcRoute = trpcLoggedProcedure
  .input(zCheckPersonalItem)
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }

    const { type, id } = input;

    if (type === "STRESS") {
      // Проверяем, есть ли слово в личном словарике
      const personalWord = await ctx.prisma.personalWord.findUnique({
        where: {
          userId_wordId: {
            userId: ctx.me.id,
            wordId: id,
          },
        },
      });

      return { isPersonal: !!personalWord };
    } else if (type === "PARONYM") {
      // Проверяем, есть ли пара паронимов в личном словарике
      const personalParonym = await ctx.prisma.personalParonym.findUnique({
        where: {
          userId_paronymPairId: {
            userId: ctx.me.id,
            paronymPairId: id,
          },
        },
      });

      return { isPersonal: !!personalParonym };
    }

    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Неподдерживаемый тип",
    });
  });