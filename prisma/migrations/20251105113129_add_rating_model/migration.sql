/*
  Warnings:

  - You are about to drop the column `score` on the `Rating` table. All the data in the column will be lost.
  - Added the required column `bookingId` to the `Rating` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Rating` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Rating" DROP COLUMN "score",
ADD COLUMN     "bookingId" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Rating" ADD CONSTRAINT "Rating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "public"."Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
