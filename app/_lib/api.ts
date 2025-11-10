import { db } from "./prisma";

export async function getBarbershop(barbershopId: string) {
  return await db.barbershop.findUnique({
    where: { id: barbershopId },
  });
}

export async function updateBarbershop(barbershopId: string, data: any) {
  return await db.barbershop.update({
    where: { id: barbershopId },
    data,
  });
}

export async function createBarbershop(data: any) {
  return await db.barbershop.create({
    data,
  });
}