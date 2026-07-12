/*
  Warnings:

  - A unique constraint covering the columns `[bookingId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Barbershop" ALTER COLUMN "images" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_bookingId_key" ON "public"."Rating"("bookingId");
