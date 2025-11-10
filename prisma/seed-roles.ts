import { PrismaClient, UserRole } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  
  const adminEmails = [
    'riquelmealb105@gmail.com',
    'riquelme.albuquerque105@gmail.com',
    '1519@estudante.se.df.gov.br',
    'felipe2pac33@gmail.com',
    'eduardolopes727@gmail.com',
    'yuriraraujo5@gmail.com',
    'zriquelme007.07@gmail.com',
    'roosevelt205@gmail.com',
    'yuri.r.araujo.dev@gmail.com',
    'yuri1.xvi@gmail.com',
]

  await prisma.user.updateMany({
    where: { email: { in: adminEmails } },
    data: { role: UserRole.ADMIN },
  })

  // Cria barbearias
  for (const email of adminEmails) {
    const user = await prisma.user.findUnique({
        where: { email },
        include: { ownedBarbershop: true }
    })
    
    if (user && !user.ownedBarbershop) {
      await prisma.barbershop.create({
        data: {
          name: `Barbearia do ${user.name || 'Admin'}`,
          address: 'Endereço a ser configurado',
          phone: ['(00) 00000-0000'],
          description: 'Barbearia premium',
          imageUrl: '/placeholder.jpg',
          ownerId: user.id,
        },
      })
    }
  }

  console.log('Roles e barbearias atribuídas com sucesso!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())