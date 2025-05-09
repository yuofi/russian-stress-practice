-- CreateEnum
CREATE TYPE "PracticeType" AS ENUM ('STRESS', 'PARONYM');

-- AlterTable
ALTER TABLE "Word" ADD COLUMN     "type" "PracticeType" NOT NULL DEFAULT 'STRESS';
