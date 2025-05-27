import { trpcLoggedProcedure } from "../../../lib/trpc";

export const GetParonymsTrpcRoute = trpcLoggedProcedure
  .query(async ({ ctx }) => {
    // Получаем все пары паронимов из базы данных
    const paronymPairs = await ctx.prisma.paronymPair.findMany({
      include: {
        words: true,
      },
    });

    // Преобразуем данные в формат, удобный для фронтенда
    const paronyms = paronymPairs.map(pair => {
      return {
        id: pair.id,
        group: pair.words.map(word => word.word),
        paronyms: pair.words.map(word => ({
          id: word.id,
          word: word.word,
          explanation: word.description || "", // Используем индивидуальное описание слова
        })),
      };
    });

    return { paronyms };
  });

