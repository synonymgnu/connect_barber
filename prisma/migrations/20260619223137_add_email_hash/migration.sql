/*
  Warnings:

  - A unique constraint covering the columns `[emailHash]` on the table `Barber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emailHash]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailHash` to the `Barber` table without a default value. This is not possible if the table is not empty.
  - Made the column `email` on table `Barber` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `emailHash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."Barber_email_key";

-- DropIndex
DROP INDEX "public"."User_email_key";

-- DropIndex
DROP INDEX "public"."UserConsent_userId_consentType_key";

-- AlterTable
ALTER TABLE "public"."Barber" ADD COLUMN     "emailHash" TEXT NOT NULL,
ALTER COLUMN "email" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "emailHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Barber_emailHash_key" ON "public"."Barber"("emailHash");

-- CreateIndex
CREATE UNIQUE INDEX "User_emailHash_key" ON "public"."User"("emailHash");
