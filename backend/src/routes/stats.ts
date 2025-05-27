export const UserStatsParams = z.object({
  type: z.enum(["STRESS", "PARONYM"]),
  period: z.number().optional(), // период в днях (7, 30, etc.)
});

export const GetUserStats = publicProcedure
  .input(UserStatsParams)
  .query(async ({ input, ctx }) => {
    const { user } = ctx;
    
    if (!user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Необходима авторизация",
      });
    }
    
    const { type, period } = input;
    const periodDate = period ? subDays(new Date(), period) : undefined;
    
    try {
      // Общая статистика в зависимости от типа практики
      if (type === "STRESS") {
        // Получаем статистику по ударениям
        const practiceQuery = {
          userId: user.id,
          word: {
            type: "STRESS",
          },
          ...(periodDate && { createdAt: { gte: periodDate } }),
        };
        
        // Общее количество попыток
        const totalAttempts = await ctx.prisma.practice.count({
          where: practiceQuery,
        });
        
        // Количество правильных попыток
        const correctAttempts = await ctx.prisma.practice.count({
          where: {
            ...practiceQuery,
            correct: true,
          },
        });
        
        // Статистика за последние 7 дней (независимо от выбранного периода)
        const recentDate = subDays(new Date(), 7);
        const recentTotalAttempts = await ctx.prisma.practice.count({
          where: {
            userId: user.id,
            word: {
              type: "STRESS",
            },
            createdAt: { gte: recentDate },
          },
        });
        
        const recentCorrectAttempts = await ctx.prisma.practice.count({
          where: {
            userId: user.id,
            word: {
              type: "STRESS",
            },
            createdAt: { gte: recentDate },
            correct: true,
          },
        });
        
        // Ежедневная статистика
        const dailyStats = await getDailyStats(ctx.prisma, user.id, "STRESS", period);
        
        // Проблемные слова
        const problemWords = await getProblemWords(ctx.prisma, user.id, "STRESS");
        
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
          userId: user.id,
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
            userId: user.id,
            createdAt: { gte: recentDate },
          },
        });
        
        const recentCorrectAttempts = await ctx.prisma.paronymPractice.count({
          where: {
            userId: user.id,
            createdAt: { gte: recentDate },
            correct: true,
          },
        });
        
        // Ежедневная статистика
        const dailyStats = await getParonymDailyStats(ctx.prisma, user.id, period);
        
        // Проблемные пары паронимов
        const problemParonyms = await getProblemParonyms(ctx.prisma, user.id);
        
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
      console.error("Error fetching user stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Не удалось получить статистику",
      });
    }
  });

// Вспомогательная функция для получения ежедневной статистики по паронимам
async function getParonymDailyStats(prisma: PrismaClient, userId: number, period?: number) {
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
  const dailyMap = new Map();
  
  practices.forEach(practice => {
    const date = format(practice.createdAt, 'yyyy-MM-dd');
    
    if (!dailyMap.has(date)) {
      dailyMap.set(date, { total: 0, correct: 0 });
    }
    
    const stats = dailyMap.get(date);
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
async function getProblemParonyms(prisma: PrismaClient, userId: number) {
  // Получаем статистику по парам паронимов
  const paronymStats = await prisma.paronymPractice.groupBy({
    by: ['paronymPairId'],
    where: {
      userId,
    },
    _count: {
      _all: true,
    },
    _sum: {
      correct: true,
    },
    having: {
      _count: {
        _all: {
          gte: 3, // Минимум 3 попытки
        },
      },
    },
    orderBy: {
      _sum: {
        correct: 'asc', // Сортируем по возрастанию правильных ответов
      },
    },
    take: 5, // Топ-5 проблемных пар
  });
  
  // Получаем информацию о парах паронимов
  const problemPairs = await Promise.all(
    paronymStats.map(async (stat) => {
      const pair = await prisma.paronymPair.findUnique({
        where: { id: stat.paronymPairId },
        include: {
          words: true,
        },
      });
      
      if (!pair) return null;
      
      // Формируем строку с паронимами через "/"
      const wordString = pair.words.map(w => w.word).join(' / ');
      
      return {
        id: pair.id,
        word: wordString,
        total: stat._count._all,
        correct: stat._sum.correct || 0,
      };
    })
  );
  
  return problemPairs.filter(Boolean);
}