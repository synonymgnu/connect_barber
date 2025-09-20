/*
  Warnings:

  - You are about to drop the column `descripton` on the `Barbershop` table. All the data in the column will be lost.
  - Added the required column `description` to the `Barbershop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" DROP COLUMN "descripton",
ADD COLUMN     "description" TEXT NOT NULL;
