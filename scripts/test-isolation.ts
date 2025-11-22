import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testIsolation() {
  // Criar segunda barbearia
  const admin2 = await prisma.user.create({
    data: {
      email: 'admin2@test.com',
      name: 'Admin 2',
      role: 'ADMIN'
    }
  })

  const barbershop2 = await prisma.barbershop.create({
    data: {
      name: 'Barbearia 2',
      address: 'Endereço 2',
      phone: ['123'],
      description: 'Teste',
      imageUrl: 'test.jpg',
      ownerId: admin2.id
    }
  })

  // Criar log para admin2
  await prisma.auditLog.create({
    data: {
      userId: admin2.id,
      action: 'TEST_BARBERSHOP_2',
      resource: 'test',
      ipAddress: '127.0.0.1'
    }
  })

  console.log('Barbearia 2 criada:', barbershop2.id)
  console.log('Admin 2:', admin2.email)

  // Verificar logs por barbearia
  const admin1 = await prisma.user.findFirst({
    where: { role: 'ADMIN', email: { not: 'admin2@test.com' } },
    include: { ownedBarbershop: true }
  })

  if (admin1?.ownedBarbershop) {
    const users1 = await prisma.user.findMany({
      where: {
        OR: [
          { ownedBarbershop: { id: admin1.ownedBarbershop.id } },
          { barber: { barbershopId: admin1.ownedBarbershop.id } },
          { bookings: { some: { service: { barbershopId: admin1.ownedBarbershop.id } } } }
        ]
      },
      select: { id: true, email: true }
    })

    const logs1 = await prisma.auditLog.findMany({
      where: { userId: { in: users1.map(u => u.id) } }
    })

    console.log('\nBarbearia 1 - Usuários:', users1.length)
    console.log('Barbearia 1 - Logs:', logs1.length)
    console.log('Logs:', logs1.map(l => l.action))
  }

  const users2 = await prisma.user.findMany({
    where: {
      OR: [
        { ownedBarbershop: { id: barbershop2.id } },
        { barber: { barbershopId: barbershop2.id } },
        { bookings: { some: { service: { barbershopId: barbershop2.id } } } }
      ]
    },
    select: { id: true, email: true }
  })

  const logs2 = await prisma.auditLog.findMany({
    where: { userId: { in: users2.map(u => u.id) } }
  })

  console.log('\nBarbearia 2 - Usuários:', users2.length)
  console.log('Barbearia 2 - Logs:', logs2.length)
  console.log('Logs:', logs2.map(l => l.action))

  await prisma.$disconnect()
}

testIsolation()
