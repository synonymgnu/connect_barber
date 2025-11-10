import { PrismaClient, UserRole } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Atualize os IDs das suas 10 barbearias
  const barbershopIds = [
    'uuid-da-barbearia-1',
    'uuid-da-barbearia-2',
    // ... adicione todos os UUIDs
  ]

  for (const barbershopId of barbershopIds) {
    // Encontra o primeiro usuário sem barbearia
    const availableUser = await prisma.user.findFirst({
      where: { 
        role: UserRole.CLIENT,
        ownedBarbershop: null 
      },
    })

    if (availableUser) {
      await prisma.user.update({
        where: { id: availableUser.id },
        data: { role: UserRole.ADMIN },
      })

      await prisma.barbershop.update({
        where: { id: barbershopId },
        data: { ownerId: availableUser.id },
      })
    }
  }

  console.log('Proprietários atribuídos com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())