import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function createTestData() {
  console.log("Creating test data...")

  try {
    // Criar uma booking para hoje com barberId
    const barber = await prisma.barber.findFirst({
      where: { user: { role: 'BARBER' } }
    })

    if (barber) {
      const today = new Date()
      today.setHours(14, 0, 0, 0) // 2 PM today

      const user = await prisma.user.findFirst({
        where: { role: 'CLIENT' }
      })

      const service = await prisma.barbershopService.findFirst()

      if (user && service) {
        await prisma.booking.create({
          data: {
            userId: user.id,
            serviceId: service.id,
            barberId: barber.id,
            date: today,
            status: 'CONFIRMED'
          }
        })

        console.log("Created test booking for today")
      } else {
        console.log("No user or service found")
      }
    } else {
      console.log("No barber found")
    }

    // Definir imageUrl como null para usar as imagens do Google ao invés das da barbearia
    const barbers = await prisma.barber.findMany()
    for (const barber of barbers) {
      // Deixar imageUrl como null para usar barber.user.image (Google images)
      await prisma.barber.update({
        where: { id: barber.id },
        data: { imageUrl: null }
      })
    }

    console.log("Reset barber images to use Google profile images")

  } catch (error) {
    console.error("Error creating test data:", error)
  }

  await prisma.$disconnect()
}

createTestData().catch(console.error)
