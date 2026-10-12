-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "serieId" TEXT;

-- CreateIndex
CREATE INDEX "Depense_userId_date_idx" ON "Depense"("userId", "date");
