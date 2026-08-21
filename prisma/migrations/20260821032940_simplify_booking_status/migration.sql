-- Cria o novo enum só com os 3 valores
CREATE TYPE "BookingStatus_new" AS ENUM ('CONFIRMED', 'COMPLETED', 'CANCELLED');

-- Remove o default antigo antes de trocar o tipo da coluna
ALTER TABLE "Booking" ALTER COLUMN "status" DROP DEFAULT;

-- Remapeia os dados existentes: PENDING vira CONFIRMED, NO_SHOW vira COMPLETED
ALTER TABLE "Booking"
  ALTER COLUMN "status" TYPE "BookingStatus_new"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'CONFIRMED'
      WHEN 'NO_SHOW' THEN 'COMPLETED'
      ELSE "status"::text
    END
  )::"BookingStatus_new";

-- Troca o tipo antigo pelo novo
DROP TYPE "BookingStatus";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";

-- Restaura o default, agora como CONFIRMED
ALTER TABLE "Booking" ALTER COLUMN "status" SET DEFAULT 'CONFIRMED';