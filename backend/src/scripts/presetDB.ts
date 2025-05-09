import { PrismaClient, PracticeType } from '@prisma/client';
import rawWords from '../data/words';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Функция для инициализации слов (адаптирована из utils.ts)
function processRawWords(rawWords: string[]): { word: string, accentIdx: number }[] {
  return rawWords.map(raw => {
    let base = '';
    let accentIdx: number | null = null;
    
    if (typeof raw !== 'string') return { 
      word: '', 
      accentIdx: -1
    };

    for (let i = 0; i < raw.length; i++) {
      const char = raw[i];
      if (typeof char !== 'string') continue;

      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        accentIdx = base.length;
        base += char.toLowerCase();
      } else {
        base += char;
      }
    }
    
    return { 
      word: base, 
      accentIdx: accentIdx || -1
    };
  });
}

async function presetDB() {
  logger.info("presetDB", "Starting database preset...");
  
  try {
    // Обработка слов из words.js
    const processedWords = processRawWords(rawWords);
    
    // Фильтрация слов с корректным ударением
    const validWords = processedWords.filter(word => word.accentIdx >= 0 && word.word.length > 0);
    
    logger.info("presetDB", `Processed ${validWords.length} valid words`);

    // Очистка существующих слов типа STRESS (опционально)
    await prisma.word.deleteMany({
      where: {
        type: PracticeType.STRESS
      }
    });
    
    logger.info("presetDB", "Deleted existing stress practice words");
    
    // Добавление слов в базу данных
    const createdWords = await prisma.word.createMany({
      data: validWords.map(word => ({
        word: word.word,
        stress: word.accentIdx,
        type: PracticeType.STRESS
      })),
      skipDuplicates: true
    });
    
    logger.info("presetDB", `Added ${createdWords.count} words to the database`);

    return { success: true, count: createdWords.count };
  } catch (error) {
    logger.error("presetDB", "Error during database preset", error as any);
    return { success: false, error };
  } finally {
    await prisma.$disconnect();
  }
}

// Запуск скрипта, если он вызван напрямую
if (require.main === module) {
  presetDB()
    .then(result => {
      if (result.success) {
        logger.info("presetDB", "Database preset completed successfully!");
        process.exit(0);
      } else {
        logger.error("presetDB", "Database preset failed!", result.error as any);
        process.exit(1);
      }
    })
    .catch(err => {
      logger.error("presetDB", "Unhandled error during database preset", err);   
      process.exit(1);
    });
}

export default presetDB;