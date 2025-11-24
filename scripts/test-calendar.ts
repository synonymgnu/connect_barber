import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testCalendar() {
  // Buscar agendamentos de dezembro
  const start = new Date('2024-12-01T00:00:00')
  const end = new Date('2024-12-31T23:59:59')

  console.log('Buscando agendamentos entre:')
  console.log('Start:', start.toISOString())
  console.log('End:', end.toISOString())

  const bookings = await prisma.booking.findMany({
    where: {
      date: {
        gte: start,
        lte: end,
      },
    },
    include: {
      user: { select: { name: true } },
      service: { select: { name: true } },
    },
    orderBy: { date: 'asc' },
  })

  console.log(`\nEncontrados: ${bookings.length} agendamentos`)
  
  bookings.forEach(b => {
    console.log(`- ${b.date.toISOString()} | ${b.user.name} | ${b.service.name} | ${b.status}`)
  })

  // Verificar todos os agendamentos
  const allBookings = await prisma.booking.findMany({
    select: { date: true, status: true },
    orderBy: { date: 'asc' },
  })

  console.log(`\nTotal de agendamentos no banco: ${allBookings.length}`)
  if (allBookings.length > 0) {
    console.log('Primeiro:', allBookings[0].date.toISOString())
    console.log('Último:', allBookings[allBookings.length - 1].date.toISOString())
  }

  await prisma.$disconnect()
}

testCalendar()
