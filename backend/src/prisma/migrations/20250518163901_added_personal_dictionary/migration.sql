-- CreateTable
CREATE TABLE "PersonalWord" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "wordId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalWord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalParonym" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paronymPairId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalParonym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalWord_userId_idx" ON "PersonalWord"("userId");

-- CreateIndex
CREATE INDEX "PersonalWord_wordId_idx" ON "PersonalWord"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalWord_userId_wordId_key" ON "PersonalWord"("userId", "wordId");

-- CreateIndex
CREATE INDEX "PersonalParonym_userId_idx" ON "PersonalParonym"("userId");

-- CreateIndex
CREATE INDEX "PersonalParonym_paronymPairId_idx" ON "PersonalParonym"("paronymPairId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalParonym_userId_paronymPairId_key" ON "PersonalParonym"("userId", "paronymPairId");

-- AddForeignKey
ALTER TABLE "PersonalWord" ADD CONSTRAINT "PersonalWord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalWord" ADD CONSTRAINT "PersonalWord_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalParonym" ADD CONSTRAINT "PersonalParonym_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalParonym" ADD CONSTRAINT "PersonalParonym_paronymPairId_fkey" FOREIGN KEY ("paronymPairId") REFERENCES "ParonymPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
