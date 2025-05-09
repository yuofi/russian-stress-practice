import { trpcLoggedProcedure } from "../../../lib/trpc";
import { zGetUserStats } from "./input";

export const GetUserStatsTrpcRoute = trpcLoggedProcedure
  .input(zGetUserStats)
  .query(async ({ ctx, input }) => {
    if (!ctx.me) {
      throw new Error("User not authenticated");
    }

    // Определяем период для фильтрации
    const periodFilter = input.period 
      ? {
          createdAt: {
            gte: new Date(Date.now() - input.period * 24 * 60 * 60 * 1000)
          }
        } 
      : {};

    // Определяем фильтр по типу слов
    const typeFilter = input.type 
      ? {
          word: {
            type: input.type
          }
        } 
      : {};

    // Получаем все практики пользователя с фильтрацией
    const practices = await ctx.prisma.practice.findMany({
      where: {
        userId: ctx.me.id,
        ...periodFilter,
        ...typeFilter
      },
      include: {
        word: {
          select: {
            id: true,
            word: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Подсчитываем общую статистику
    const totalAttempts = practices.length;
    const correctAttempts = practices.filter(p => p.correct).length;
    const correctRate = totalAttempts > 0 ? correctAttempts / totalAttempts : 0;

    // Группируем по дням для построения графика
    const dailyStats = practices.reduce((acc, practice) => {
      const date = practice.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, correct: 0 };
      }
      acc[date].total += 1;
      if (practice.correct) {
        acc[date].correct += 1;
      }
      return acc;
    }, {} as Record<string, { total: number, correct: number }>);

    // Группируем по словам для определения проблемных слов
    const wordStats = practices.reduce((acc, practice) => {
      const wordId = practice.wordId;
      if (!acc[wordId]) {
        acc[wordId] = { 
          word: practice.word.word,
          total: 0, 
          correct: 0,
          type: practice.word.type
        };
      }
      acc[wordId].total += 1;
      if (practice.correct) {
        acc[wordId].correct += 1;
      }
      return acc;
    }, {} as Record<number, { word: string, total: number, correct: number, type: string }>);

    // Находим проблемные слова (низкий процент правильных ответов)
    const problemWords = Object.values(wordStats)
      .filter(stat => stat.total >= 3) // Минимум 3 попытки
      .sort((a, b) => (a.correct / a.total) - (b.correct / b.total))
      .slice(0, 5); // Топ-5 проблемных слов

    return {
      summary: {
        totalAttempts,
        correctAttempts,
        correctRate,
        // Добавляем статистику за последние 7 дней, если не указан период
        recentStats: !input.period ? {
          totalAttempts: practices.filter(p => 
            p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length,
          correctAttempts: practices.filter(p => 
            p.createdAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && p.correct
          ).length
        } : undefined
      },
      dailyStats: Object.entries(dailyStats).map(([date, stats]) => ({
        date,
        total: stats.total,
        correct: stats.correct,
        rate: stats.total > 0 ? stats.correct / stats.total : 0
      })),
      problemWords
    };
  });