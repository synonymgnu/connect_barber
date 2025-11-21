import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    include: {
      ownedBarbershop: true
    }
  })

  console.log('Admin:', admin?.email, 'Barbershop:', admin?.ownedBarbershop?.id)

  const client = await prisma.user.findFirst({
    where: { role: 'CLIENT' }
  })

  console.log('Client:', client?.email)

  // Verificar se cliente tem agendamentos na barbearia do admin
  if (admin?.ownedBarbershop && client) {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: client.id,
        service: {
          barbershopId: admin.ownedBarbershop.id
        }
      }
    })
    console.log('Cliente tem', bookings.length, 'agendamentos na barbearia do admin')
  }

  await prisma.$disconnect()
}

check()
