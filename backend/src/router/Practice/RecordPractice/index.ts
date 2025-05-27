import { PrismaClient, Practice, User } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zRecordPractice } from "./input";

// Определяем типы для результатов
type StressPracticeResult = {
  success: boolean;
  practice: Practice;
};

type ParonymPracticeResult = {
  success: boolean;
  paronymPractice: {
    id: number;
    userId: number;
    paronymPairId: number;
    selectedWordId: number;
    correctWordId: number;
    correct: boolean;
    createdAt: Date;
  };
};

type PracticeResult = StressPracticeResult | ParonymPracticeResult;

export const RecordPracticeTrpcRoute = trpcLoggedProcedure
  .input(zRecordPractice)
  .mutation(async ({ input, ctx }): Promise<PracticeResult> => {
    const user = ctx.me;
    
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }
    
    // Определяем тип практики по входным данным, если не указан явно
    const practiceType = input.type || 
      (input.wordId ? "STRESS" : input.paronymPairId ? "PARONYM" : undefined);
    
    if (!practiceType) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Не удалось определить тип практики",
      });
    }
    
    try {
      if (practiceType === "STRESS") {
        // Проверяем наличие необходимых полей для практики ударений
        if (!input.wordId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Для практики ударений необходимо указать wordId",
          });
        }
        
        // Записываем результат практики ударений
        const practice = await ctx.prisma.practice.create({
          data: {
            userId: user.id,
            wordId: input.wordId,
            correct: input.correct,
          },
        });
        
        // Обновляем счет пользователя
        await updateUserScore(ctx.prisma as any, user.id, input.correct);
        
        return { success: true, practice };
      } 
      else if (practiceType === "PARONYM") {
        // Проверяем наличие необходимых полей для практики паронимов
        if (!input.paronymPairId || !input.selectedWordId || !input.correctWordId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Для практики паронимов необходимо указать paronymPairId, selectedWordId и correctWordId",
          });
        }
        
        // Записываем результат практики паронимов
        const paronymPractice = await ctx.prisma.paronymPractice.create({
          data: {
            userId: user.id,
            paronymPairId: input.paronymPairId,
            selectedWordId: input.selectedWordId,
            correctWordId: input.correctWordId,
            correct: input.correct,
          },
        });
        
        // Обновляем счет пользователя
        await updateUserScore(ctx.prisma as any, user.id, input.correct);
        
        return { success: true, paronymPractice };
      }
      
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Неподдерживаемый тип практики",
      });
    } catch (error) {
      
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось записать результат практики",
        cause: error,
      });
    }
  });

// Вспомогательная функция для обновления счета пользователя
async function updateUserScore(
  prisma: PrismaClient, 
  userId: number, 
  correct: boolean
): Promise<User> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      score: {
        increment: correct ? 1 : 0,
      },
    },
  });
}

