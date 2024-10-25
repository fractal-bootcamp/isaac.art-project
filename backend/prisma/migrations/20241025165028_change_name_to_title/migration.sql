/*
  Warnings:

  - You are about to drop the column `name` on the `DrumLoop` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DrumLoop" DROP COLUMN "name",
ADD COLUMN     "title" TEXT NOT NULL DEFAULT 'Default title';
