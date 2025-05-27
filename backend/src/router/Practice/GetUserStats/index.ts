import { PrismaClient, PracticeType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { format, subDays } from "date-fns";
import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zGetUserStats } from "./input";

export const GetUserStatsTrpcRoute = trpcLoggedProcedure
  .input(zGetUserStats)
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }

    const { type, period } = input;
    
    // Определяем период для фильтрации
    const periodDate = period 
      ? new Date(Date.now() - period * 24 * 60 * 60 * 1000)
      : undefined;

    try {
      // Общая статистика в зависимости от типа практики
      if (type === "STRESS") {
        // Получаем статистику по ударениям
        const practiceQuery = {
          userId: ctx.me.id,
          word: {
            type: "STRESS",
          },
          ...(periodDate && { createdAt: { gte: periodDate } }),
        };
        
        // Общее количество попыток
        const totalAttempts = await ctx.prisma.practice.count({
          where: {
            ...practiceQuery,
            word: {
              type: PracticeType.STRESS,
            },
          },
        });
        
        // Количество правильных попыток
        const correctAttempts = await ctx.prisma.practice.count({
          where: {
            ...practiceQuery,
            word: {
              type: PracticeType.STRESS,
            },
            correct: true,
          },
        });
        
        // Статистика за последние 7 дней (независимо от выбранного периода)
        const recentDate = subDays(new Date(), 7);
        const recentTotalAttempts = await ctx.prisma.practice.count({
          where: {
            userId: ctx.me.id,
            word: {
              type: "STRESS",
            },
            createdAt: { gte: recentDate },
          },
        });
        
        const recentCorrectAttempts = await ctx.prisma.practice.count({
          where: {
            userId: ctx.me.id,
            word: {
              type: "STRESS",
            },
            createdAt: { gte: recentDate },
            correct: true,
          },
        });
        
        // Ежедневная статистика
        const dailyStats = await getDailyStats(ctx.prisma as any, ctx.me.id, "STRESS", period);
        
        // Проблемные слова
        const problemWords = await getProblemWords(ctx.prisma as any, ctx.me.id, "STRESS");
        
        return {
          summary: {
            totalAttempts,
            correctAttempts,
            correctRate: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
            recentStats: {
              totalAttempts: recentTotalAttempts,
              correctAttempts: recentCorrectAttempts,
              correctRate: recentTotalAttempts > 0 ? recentCorrectAttempts / recentTotalAttempts : 0,
            },
          },
          dailyStats,
          problemWords,
        };
      } 
      else if (type === "PARONYM") {
        // Получаем статистику по паронимам
        const practiceQuery = {
          userId: ctx.me.id,
          ...(periodDate && { createdAt: { gte: periodDate } }),
        };
        
        // Общее количество попыток
        const totalAttempts = await ctx.prisma.paronymPractice.count({
          where: practiceQuery,
        });
        
        // Количество правильных попыток
        const correctAttempts = await ctx.prisma.paronymPractice.count({
          where: {
            ...practiceQuery,
            correct: true,
          },
        });
        
        // Статистика за последние 7 дней (независимо от выбранного периода)
        const recentDate = subDays(new Date(), 7);
        const recentTotalAttempts = await ctx.prisma.paronymPractice.count({
          where: {
            userId: ctx.me.id,
            createdAt: { gte: recentDate },
          },
        });
        
        const recentCorrectAttempts = await ctx.prisma.paronymPractice.count({
          where: {
            userId: ctx.me.id,
            createdAt: { gte: recentDate },
            correct: true,
          },
        });
        
        // Ежедневная статистика
        const dailyStats = await getParonymDailyStats(ctx.prisma as any, ctx.me.id, period);
        
        // Проблемные пары паронимов
        const problemParonyms = await getProblemParonyms(ctx.prisma as any, ctx.me.id);
        
        return {
          summary: {
            totalAttempts,
            correctAttempts,
            correctRate: totalAttempts > 0 ? correctAttempts / totalAttempts : 0,
            recentStats: {
              totalAttempts: recentTotalAttempts,
              correctAttempts: recentCorrectAttempts,
              correctRate: recentTotalAttempts > 0 ? recentCorrectAttempts / recentTotalAttempts : 0,
            },
          },
          dailyStats,
          problemWords: problemParonyms, // Используем тот же формат для совместимости
        };
      }
      
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Неподдерживаемый тип практики",
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error fetching user stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить статистику",
        cause: error,
      });
    }
  });

// Типы для статистики
type DailyStats = {
  date: string;
  total: number;
  correct: number;
  rate: number;
};

type ProblemWord = {
  id: number;
  word: string;
  total: number;
  correct: number;
};

// Вспомогательная функция для получения ежедневной статистики по ударениям
async function getDailyStats(
  prisma: PrismaClient, 
  userId: number, 
  type: PracticeType, 
  period?: number
): Promise<DailyStats[]> {
  const periodDays = period || 30; // По умолчанию 30 дней
  const startDate = subDays(new Date(), periodDays);
  
  // Получаем все попытки за указанный период
  const practices = await prisma.practice.findMany({
    where: {
      userId,
      word: {
        type,
      },
      createdAt: { gte: startDate },
    },
    select: {
      correct: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Группируем по дням
  const dailyMap = new Map<string, { total: number; correct: number }>();
  
  practices.forEach(practice => {
    const date = format(practice.createdAt, 'yyyy-MM-dd');
    
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { total: 0, correct: 0 });
    }
    
    const stats = dailyMap.get(date)!;
    stats.total += 1;
    if (practice.correct) {
      stats.correct += 1;
    }
  });
  
  // Преобразуем в массив
  const result = Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    total: stats.total,
    correct: stats.correct,
    rate: stats.total > 0 ? stats.correct / stats.total : 0,
  }));
  
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Вспомогательная функция для получения проблемных слов
async function getProblemWords(
  prisma: PrismaClient, 
  userId: number, 
  type: PracticeType
): Promise<ProblemWord[]> {
  // Получаем все попытки пользователя для данного типа практики
  const practices = await prisma.practice.findMany({
    where: {
      userId,
      word: {
        type,
      },
    },
    include: {
      word: true,
    },
  });
  
  // Группируем по словам и считаем статистику
  const wordStats = new Map<number, { word: string, total: number, correct: number }>();
  
  practices.forEach(practice => {
    const wordId = practice.wordId;
    
    if (!wordStats.has(wordId)) {
      wordStats.set(wordId, { 
        word: practice.word.word, 
        total: 0, 
        correct: 0 
      });
    }
    
    const stats = wordStats.get(wordId)!;
    stats.total += 1;
    if (practice.correct) {
      stats.correct += 1;
    }
  });
  
  // Преобразуем в массив и фильтруем слова с минимум 3 попытками
  const result = Array.from(wordStats.entries())
    .map(([id, stats]) => ({
      id,
      word: stats.word,
      total: stats.total,
      correct: stats.correct,
    }))
    .filter(word => word.total >= 3)
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total)); // Сортируем по проценту правильных ответов
  
  return result.slice(0, 5); // Возвращаем топ-5 проблемных слов
}

// Вспомогательная функция для получения ежедневной статистики по паронимам
async function getParonymDailyStats(
  prisma: PrismaClient, 
  userId: number, 
  period?: number
): Promise<DailyStats[]> {
  const periodDays = period || 30; // По умолчанию 30 дней
  const startDate = subDays(new Date(), periodDays);
  
  // Получаем все попытки за указанный период
  const practices = await prisma.paronymPractice.findMany({
    where: {
      userId,
      createdAt: { gte: startDate },
    },
    select: {
      correct: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
  
  // Группируем по дням
  const dailyMap = new Map<string, { total: number; correct: number }>();
  
  practices.forEach(practice => {
    const date = format(practice.createdAt, 'yyyy-MM-dd');
    
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { total: 0, correct: 0 });
    }
    
    const stats = dailyMap.get(date)!;
    stats.total += 1;
    if (practice.correct) {
      stats.correct += 1;
    }
  });
  
  // Преобразуем в массив
  const result = Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    total: stats.total,
    correct: stats.correct,
    rate: stats.total > 0 ? stats.correct / stats.total : 0,
  }));
  
  return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Вспомогательная функция для получения проблемных пар паронимов
async function getProblemParonyms(
  prisma: PrismaClient, 
  userId: number
): Promise<ProblemWord[]> {
  // Получаем все попытки пользователя для паронимов
  const practices = await prisma.paronymPractice.findMany({
    where: {
      userId,
    },
    include: {
      paronymPair: {
        include: {
          words: true,
        },
      },
    },
  });
  
  // Группируем по парам паронимов и считаем статистику
  const pairStats = new Map<number, { 
    words: string, 
    total: number, 
    correct: number 
  }>();
  
  practices.forEach(practice => {
    const pairId = practice.paronymPairId;
    
    if (!pairStats.has(pairId)) {
      // Формируем строку с паронимами через "/"
      const wordString = practice.paronymPair.words.map(w => w.word).join(' / ');
      
      pairStats.set(pairId, { 
        words: wordString, 
        total: 0, 
        correct: 0 
      });
    }
    
    const stats = pairStats.get(pairId)!;
    stats.total += 1;
    if (practice.correct) {
      stats.correct += 1;
    }
  });
  
  // Преобразуем в массив и фильтруем пары с минимум 3 попытками
  const result = Array.from(pairStats.entries())
    .map(([id, stats]) => ({
      id,
      word: stats.words,
      total: stats.total,
      correct: stats.correct,
    }))
    .filter(pair => pair.total >= 3)
    .sort((a, b) => (a.correct / a.total) - (b.correct / b.total)); // Сортируем по проценту правильных ответов
  
  return result.slice(0, 5); // Возвращаем топ-5 проблемных пар
}







