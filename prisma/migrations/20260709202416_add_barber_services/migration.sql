-- CreateTable
CREATE TABLE "public"."_BarberServices" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BarberServices_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BarberServices_B_index" ON "public"."_BarberServices"("B");

-- AddForeignKey
ALTER TABLE "public"."_BarberServices" ADD CONSTRAINT "_BarberServices_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_BarberServices" ADD CONSTRAINT "_BarberServices_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."BarbershopService"("id") ON DELETE CASCADE ON UPDATE CASCADE;
