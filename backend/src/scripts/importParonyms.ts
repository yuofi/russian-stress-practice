import { PrismaClient, PracticeType } from "@prisma/client";
import paronymData from "../data/paronyms";
import { logger } from "../utils/logger";

async function importParonyms() {
  const prisma = new PrismaClient();
  logger.info("presetDB", "starting paronyms import...");
  
  try {
    // Для каждой группы паронимов
    for (const group of paronymData) {
      logger.info("presetDB", `Обрабатываем группу: ${group.group.join(", ")}`);
      
      // Создаем или находим слова для каждого паронима
      const wordRecords = [];
      
      for (const paronym of group.paronyms) {
        // Ищем слово в базе данных
        let word = await prisma.word.findFirst({
          where: {
            word: paronym.word,
          },
        });
        
        // Если слово не найдено, создаем его
        if (!word) {
          word = await prisma.word.create({
            data: {
              word: paronym.word,
              stress: 0, // Для паронимов позиция ударения не важна
              type: PracticeType.PARONYM,
              description: paronym.explanation // Сохраняем индивидуальное описание
            },
          });
          logger.info("presetDB", `Created new word: ${word.word} with explanation: ${paronym.explanation}`);
        } else {
          // Обновляем тип слова и описание, если оно уже существует
          word = await prisma.word.update({
            where: { id: word.id },
            data: { 
              type: PracticeType.PARONYM,
              description: paronym.explanation
            }
          });
        }
        
        wordRecords.push(word);
      }
      
      // Создаем пару паронимов и связываем с словами
      const paronymPair = await prisma.paronymPair.create({
        data: {
          words: {
            connect: wordRecords.map(word => ({ id: word.id }))
          }
        }
      });
      
      logger.info("presetDB", `Created paronym pair with ID: ${paronymPair.id}`);
    }
    
    logger.info("presetDB", "Paronyms import completed successfully");
  } catch(error) {
    logger.error("presetDB", "Error during database preset", error as any);
  } finally {
    await prisma.$disconnect();
  }
}

// Вызываем функцию импорта
if (require.main === module) {
  importParonyms()
    .then(() => {
      logger.info("presetDB", "Import script finished");
      process.exit(0);
    })
    .catch(error => {
      logger.error("presetDB", "Import script failed", error);
      process.exit(1);
    });
}

export default importParonyms;

