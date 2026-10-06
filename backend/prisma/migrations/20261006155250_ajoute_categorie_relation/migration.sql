/*
  Warnings:

  - You are about to drop the column `categorie` on the `Depense` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Depense" DROP COLUMN "categorie",
ADD COLUMN     "categorieId" TEXT;

-- CreateTable
CREATE TABLE "Categorie" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "couleur" TEXT NOT NULL,

    CONSTRAINT "Categorie_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie"("id") ON DELETE SET NULL ON UPDATE CASCADE;
