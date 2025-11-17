-- CreateEnum
CREATE TYPE "public"."AbsenceType" AS ENUM ('BARBER_ABSENCE', 'SHOP_CLOSURE');

-- AlterTable
ALTER TABLE "public"."BarberAbsence" ADD COLUMN     "type" "public"."AbsenceType" NOT NULL DEFAULT 'BARBER_ABSENCE',
ALTER COLUMN "barberId" DROP NOT NULL;
