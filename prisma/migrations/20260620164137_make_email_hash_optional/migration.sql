-- AlterTable
ALTER TABLE "public"."Barber" ALTER COLUMN "emailHash" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "emailHash" DROP NOT NULL;
