-- 1. Adiciona a nova coluna
ALTER TABLE "Barbershop" ADD COLUMN "images" TEXT[] NOT NULL DEFAULT '{}';

-- 2. Copia o valor de imageUrl para dentro do array images
UPDATE "Barbershop"
SET "images" = ARRAY["imageUrl"]
WHERE "imageUrl" IS NOT NULL AND "imageUrl" != '';

-- 3. Remove a coluna antiga
ALTER TABLE "Barbershop" DROP COLUMN "imageUrl";