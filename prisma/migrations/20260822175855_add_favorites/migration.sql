-- CreateTable
CREATE TABLE "public"."FavoriteBarbershop" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barbershopId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBarbershop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FavoriteBarber" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barberId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteBarber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FavoriteBarbershop_userId_idx" ON "public"."FavoriteBarbershop"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBarbershop_userId_barbershopId_key" ON "public"."FavoriteBarbershop"("userId", "barbershopId");

-- CreateIndex
CREATE INDEX "FavoriteBarber_userId_idx" ON "public"."FavoriteBarber"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteBarber_userId_barberId_key" ON "public"."FavoriteBarber"("userId", "barberId");

-- AddForeignKey
ALTER TABLE "public"."FavoriteBarbershop" ADD CONSTRAINT "FavoriteBarbershop_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteBarbershop" ADD CONSTRAINT "FavoriteBarbershop_barbershopId_fkey" FOREIGN KEY ("barbershopId") REFERENCES "public"."Barbershop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteBarber" ADD CONSTRAINT "FavoriteBarber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FavoriteBarber" ADD CONSTRAINT "FavoriteBarber_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "public"."Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
