/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Track` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Track` table. All the data in the column will be lost.
  - The `pattern` column on the `Track` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Track" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
DROP COLUMN "pattern",
ADD COLUMN     "pattern" BOOLEAN[];
