import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function checkData() {
  console.log("Checking data...")

  try {
    // Verificar apenas bookings para hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const bookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        user: {
          select: { name: true }
        },
        service: {
          select: { name: true }
        }
      }
    })

    console.log("Today's bookings:", bookings.length)
    bookings.forEach(booking => {
      console.log(`- Client: ${booking.user.name}, Service: ${booking.service.name}, Date: ${booking.date}`)
    })

    // Verificar recent bookings
    const recentDate = new Date()
    recentDate.setDate(recentDate.getDate() - 90)

    const recentBookings = await prisma.booking.findMany({
      where: {
        date: {
          gte: recentDate
        }
      },
      include: {
        user: {
          select: { name: true }
        },
        service: {
          select: { name: true }
        },
        barber: {
          select: { id: true, name: true }
        }
      },
      take: 10
    })

    console.log("Recent bookings (last 90 days, limited to 10):", recentBookings.length)
    recentBookings.forEach(booking => {
      console.log(`- Client: ${booking.user.name}, Service: ${booking.service.name}, Barber: ${booking.barber?.name || 'null'}, Date: ${booking.date}`)
    })

    // Verificar quantos bookings têm barberId definido
    const bookingStats = await prisma.booking.groupBy({
      by: ['barberId'],
      where: {
        date: {
          gte: recentDate
        },
        barberId: { not: null }
      },
      _count: {
        barberId: true
      }
    })

    console.log("Recent bookings with barberId:", bookingStats.reduce((sum, stat) => sum + stat._count.barberId, 0))

    const bookingStatsNull = await prisma.booking.count({
      where: {
        date: {
          gte: recentDate
        },
        barberId: null
      }
    })

    console.log("Recent bookings without barberId:", bookingStatsNull)

    // Verificar usuários BARBER
    const barberUsers = await prisma.user.findMany({
      where: {
        role: 'BARBER'
      },
      include: {
        barber: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Verificar barbeiros com detalhes
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        name: true,
        imageUrl: true,
        user: {
          select: {
            image: true
          }
        },
        bookings: {
          select: {
            id: true
          },
          where: {
            date: {
              gte: recentDate
            },
            status: 'COMPLETED'
          }
        }
      }
    })

    console.log("BARBER users:", barberUsers.length)
    barberUsers.forEach(user => {
      console.log(`- ${user.name || user.email}: barberId=${user.barber?.id || 'null'}, barberName=${user.barber?.name || 'null'}`)
    })

    console.log("Barbers details:")
    barbers.forEach(barber => {
      console.log(`- ${barber.name}: id=${barber.id}, imageUrl=${barber.imageUrl || 'null'}, userImage=${barber.user.image || 'null'}, bookings=${barber.bookings.length}`)
    })

  } catch (error) {
    console.error("Error checking data:", error)
  }

  await prisma.$disconnect()
}

checkData().catch(console.error)
