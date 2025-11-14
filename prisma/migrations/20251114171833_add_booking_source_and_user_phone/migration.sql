-- CreateEnum
CREATE TYPE "public"."BookingSource" AS ENUM ('PRESENCIAL', 'ONLINE');

-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "employee" TEXT,
ADD COLUMN     "source" "public"."BookingSource" NOT NULL DEFAULT 'ONLINE',
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "phone" TEXT;
