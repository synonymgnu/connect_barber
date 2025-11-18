import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const bookingId = params.id

    // Verificar se o agendamento existe e se o usuário tem permissão
    const existingBooking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: true,
        service: { include: { barbershop: true } }
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === "BARBER") {
      if (existingBooking.barberId !== session.user.barberId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (session.user.role === "ADMIN") {
      if (existingBooking.service.barbershop.id !== session.user.barbershopId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Verificar conflito de horário se a data ou barbeiro mudou
    const newDate = data.date ? new Date(data.date) : existingBooking.date
    const newBarberId = data.barberId || existingBooking.barberId
    
    if (data.date || data.barberId) {
      const conflictBooking = await db.booking.findFirst({
        where: {
          barberId: newBarberId,
          date: newDate,
          status: { not: "CANCELLED" },
          id: { not: bookingId }
        },
      })

      if (conflictBooking) {
        return NextResponse.json({ error: "Horário indisponível" }, { status: 409 })
      }
    }

    // Preparar dados para atualização
    const updateData: any = {}
    
    if (data.serviceId && data.serviceId !== existingBooking.serviceId) {
      updateData.serviceId = data.serviceId
    }
    if (data.barberId && data.barberId !== existingBooking.barberId) {
      updateData.barberId = data.barberId
    }
    if (data.date && new Date(data.date).getTime() !== existingBooking.date.getTime()) {
      updateData.date = new Date(data.date)
    }
    if (data.status && data.status !== existingBooking.status) {
      updateData.status = data.status
    }
    if (data.source && data.source !== existingBooking.source) {
      updateData.source = data.source
    }


    // Atualizar agendamento apenas se houver mudanças
    const updatedBooking = Object.keys(updateData).length > 0 
      ? await db.booking.update({
          where: { id: bookingId },
          data: updateData,
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            service: { select: { id: true, name: true, price: true, duration: true } },
            barber: { select: { id: true, name: true } },
          },
        })
      : await db.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            service: { select: { id: true, name: true, price: true, duration: true } },
            barber: { select: { id: true, name: true } },
          },
        })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error("Error updating appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const bookingId = params.id

    // Verificar se o agendamento existe e se o usuário tem permissão
    const existingBooking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        barber: true,
        service: { include: { barbershop: true } }
      }
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Verificar permissões
    if (session.user.role === "BARBER") {
      if (existingBooking.barberId !== session.user.barberId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else if (session.user.role === "ADMIN") {
      if (existingBooking.service.barbershop.id !== session.user.barbershopId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    }

    // Excluir agendamento
    await db.booking.delete({
      where: { id: bookingId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}