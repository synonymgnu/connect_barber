import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { BookingStatus } from "@prisma/client"

function getEventColorByStatus(status: BookingStatus): string {
  switch (status) {
    case BookingStatus.PENDING:  return '#f59e0b'
    case BookingStatus.CONFIRMED: return '#8161FF'
    case BookingStatus.COMPLETED: return '#10b981'
    case BookingStatus.CANCELLED: return '#ef4444'
    default: return '#8161FF'
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const start = searchParams.get("start")
    const end = searchParams.get("end")

    const whereClause: any = {
      date: {
        gte: new Date(start!),
        lte: new Date(end!),
      },
    }

    // Filtra por permissão
    if (session.user.role === "BARBER") {
      if (!session.user.barberId) {
        return NextResponse.json({ error: "Barber not found" }, { status: 404 })
      }
      whereClause.barberId = session.user.barberId
    } else if (session.user.role === "ADMIN") {
      if (!session.user.barbershopId) {
        return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })
      }
      whereClause.service = {
        barbershopId: session.user.barbershopId,
      }
    }

    const bookings = await db.booking.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
        barber: { select: { id: true, name: true } },
      },
      orderBy: { date: "asc" },
    })

    console.log('[CALENDAR API] Sample booking user data:', bookings[0]?.user)

    const events = bookings.map(booking => ({
      id: booking.id,
      title: `${booking.user.name} - ${booking.service.name}`,
      start: booking.date,
      end: new Date(
        new Date(booking.date).getTime() + (booking.service.duration * 60000)
      ).toISOString(),
      backgroundColor: getEventColorByStatus(booking.status),
      borderColor: getEventColorByStatus(booking.status),
      extendedProps: {
        id: booking.id,
        date: booking.date,
        status: booking.status.toLowerCase(),
        source: booking.source,
        notes: booking.notes,
        user: {
          id: booking.user.id,
          name: booking.user.name,
          email: booking.user.email,
          phone: booking.user.phone,
        },
        service: {
          id: booking.service.id,
          name: booking.service.name,
          price: booking.service.price,
          duration: booking.service.duration,
        },
        barber: booking.barber ? {
          id: booking.barber.id,
          name: booking.barber.name,
        } : null,
      },
    }))

    const absences = await db.barberAbsence.findMany({
      where: {
        OR: [
          ...(session.user.barberId ? [{ barberId: session.user.barberId }] : []),
          ...(session.user.barbershopId ? [{ 
            type: "SHOP_CLOSURE" as const,
            barber: { barbershopId: session.user.barbershopId }
          }] : [])
        ],
        date: {
          gte: new Date(start!),
          lte: new Date(end!),
        },
      },
      include: {
        barber: { select: { name: true } }
      }
    })

    return NextResponse.json({ events, absences })
  } catch (error) {
    console.error("Error fetching calendar appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    console.log('[CREATE BOOKING] Received data:', JSON.stringify(data, null, 2))
    
    // Validação de permissões
    const barbershopId = session.user.barbershopId
    if (session.user.role === "ADMIN" && !barbershopId) {
      return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })
    }

    if (session.user.role === "ADMIN" && data.barberId) {
      const barber = await db.barber.findFirst({
        where: { id: data.barberId, barbershopId: barbershopId || undefined },
      })
      if (!barber) {
        return NextResponse.json({ error: "Barber not found" }, { status: 404 })
      }
    }

    const existingBooking = await db.booking.findFirst({
      where: {
        barberId: session.user.role === "BARBER" ? session.user.barberId || undefined : data.barberId,
        date: data.date,
        status: { not: "CANCELLED" },
      },
    })

    if (existingBooking) {
      return NextResponse.json({ error: "Horário indisponível" }, { status: 409 })
    }

    // Criar ou encontrar usuário
    let userId = data.userId
    if (!userId) {
      if (!data.userName) {
        return NextResponse.json({ error: "Nome do cliente é obrigatório" }, { status: 400 })
      }

      let user = null
      
      if (data.userEmail) {
        user = await db.user.findUnique({ where: { email: data.userEmail } })
      }
      
      if (!user) {
        user = await db.user.create({
          data: {
            name: data.userName,
            email: data.userEmail || `cliente_${Date.now()}@temp.com`,
            phone: data.userPhone || null,
            role: 'CLIENT',
          },
        })
      } else {
        const updateData: any = {}
        if (data.userName && user.name !== data.userName) updateData.name = data.userName
        if (data.userPhone && user.phone !== data.userPhone) updateData.phone = data.userPhone
        
        if (Object.keys(updateData).length > 0) {
          user = await db.user.update({
            where: { id: user.id },
            data: updateData
          })
        }
      }
      
      userId = user.id
    }
    
    console.log('[CREATE BOOKING] Final userId:', userId)

    const booking = await db.booking.create({
      data: {
        userId: userId,
        serviceId: data.serviceId,
        barberId: session.user.role === "BARBER" ? session.user.barberId || undefined : data.barberId,
        date: new Date(data.date),
        status: data.status || "PENDING",
        source: session.user.role === "BARBER" ? "PRESENCIAL" : data.source || "ONLINE",
        notes: data.notes || null,
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, price: true, duration: true } },
        barber: { select: { id: true, name: true } },
      },
    })

    console.log('[CREATE BOOKING] Created booking:', JSON.stringify({
      id: booking.id,
      userName: booking.user.name,
      userEmail: booking.user.email
    }, null, 2))
    
    return NextResponse.json(booking)
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}