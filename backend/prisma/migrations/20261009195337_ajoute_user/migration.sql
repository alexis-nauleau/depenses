/*
  Warnings:

  - Added the required column `userId` to the `Categorie` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Depense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Categorie" ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Depense" ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "motDePasse" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Categorie" ADD CONSTRAINT "Categorie_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Depense" ADD CONSTRAINT "Depense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
