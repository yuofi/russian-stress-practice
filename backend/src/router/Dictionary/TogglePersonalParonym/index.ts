import { TRPCError } from "@trpc/server";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zTogglePersonalParonym } from "./input";

export const TogglePersonalParonymTrpcRoute = trpcLoggedProcedure
  .input(zTogglePersonalParonym)
  .mutation(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }

    const { paronymPairId, isPersonal } = input;

    // Проверяем существование пары паронимов
    const paronymPair = await ctx.prisma.paronymPair.findUnique({
      where: { id: paronymPairId },
    });

    if (!paronymPair) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Пара паронимов не найдена",
      });
    }

    // Проверяем, есть ли уже эта пара в личном словарике
    const existingEntry = await ctx.prisma.personalParonym.findUnique({
      where: {
        userId_paronymPairId: {
          userId: ctx.me.id,
          paronymPairId: paronymPairId,
        },
      },
    });

    if (isPersonal) {
      // Если нужно добавить в словарик и записи еще нет
      if (!existingEntry) {
        await ctx.prisma.personalParonym.create({
          data: {
            userId: ctx.me.id,
            paronymPairId: paronymPairId,
          },
        });
      }
    } else {
      // Если нужно удалить из словарика и запись существует
      if (existingEntry) {
        await ctx.prisma.personalParonym.delete({
          where: {
            id: existingEntry.id,
          },
        });
      }
    }

    return { success: true, paronymPair };
  });