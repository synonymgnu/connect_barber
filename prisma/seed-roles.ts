import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminIds =
    process.env.ADMIN_IDS?.split(',').map((id) => id.trim()) || []
  if (adminIds.length === 0) throw new Error('ADMIN_IDS não definido no.env')

  const availableBarbershops = await prisma.barbershop.findMany({
    where: { ownerId: null },
  })

  let barbershopIndex = 0

  for (const adminId of adminIds) {
    const user = await prisma.user.findUnique({
      where: { id: adminId },
      include: { ownedBarbershop: true },
    })

    if (!user) {
      console.log(`User ${adminId} não encontrado`)
      continue
    }

    await prisma.user.update({
      where: { id: adminId },
      data: { role: UserRole.ADMIN },
    })

    if (user.ownedBarbershop) {
      console.log(`Admin ${adminId} já é dono da: ${user.ownedBarbershop.name}`)
      continue // PULA ESSA PORRA
    }

    if (barbershopIndex >= availableBarbershops.length) {
      console.log(`Sem barbearias livres pra ${adminId}`)
      break
    }

    const barbershop = availableBarbershops[barbershopIndex++]

    await prisma.barbershop.update({
      where: { id: barbershop.id },
      data: { ownerId: adminId },
    })

    console.log(`Atribuído: "${barbershop.name}" -> ${adminId}`)
  }
}

main().finally(() => prisma.$disconnect())
