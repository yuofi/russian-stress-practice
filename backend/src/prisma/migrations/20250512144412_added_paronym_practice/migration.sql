-- CreateTable
CREATE TABLE "ParonymPair" (
    "id" SERIAL NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParonymPair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParonymPractice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "paronymPairId" INTEGER NOT NULL,
    "selectedWordId" INTEGER NOT NULL,
    "correctWordId" INTEGER NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParonymPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ParonymWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ParonymWords_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ParonymPractice_userId_idx" ON "ParonymPractice"("userId");

-- CreateIndex
CREATE INDEX "ParonymPractice_paronymPairId_idx" ON "ParonymPractice"("paronymPairId");

-- CreateIndex
CREATE INDEX "_ParonymWords_B_index" ON "_ParonymWords"("B");

-- AddForeignKey
ALTER TABLE "ParonymPractice" ADD CONSTRAINT "ParonymPractice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParonymPractice" ADD CONSTRAINT "ParonymPractice_paronymPairId_fkey" FOREIGN KEY ("paronymPairId") REFERENCES "ParonymPair"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParonymWords" ADD CONSTRAINT "_ParonymWords_A_fkey" FOREIGN KEY ("A") REFERENCES "ParonymPair"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ParonymWords" ADD CONSTRAINT "_ParonymWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;
