import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { notifyBookingConfirmed, notifyBookingUpdated } from "@/app/_lib/notifications/create-notification"
import { validateBookingTime } from "@/app/_lib/booking-validation"

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
    console.log('[UPDATE BOOKING] Received data:', JSON.stringify(data, null, 2))
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

    // Atualizar dados do cliente se fornecidos
    if (data.userName || data.userEmail || data.userPhone) {
      const userUpdateData: any = {}
      if (data.userName) userUpdateData.name = data.userName
      if (data.userEmail) userUpdateData.email = data.userEmail
      if (data.userPhone) userUpdateData.phone = data.userPhone
      
      console.log('[UPDATE BOOKING] Updating user:', existingBooking.userId, userUpdateData)
      
      await db.user.update({
        where: { id: existingBooking.userId },
        data: userUpdateData
      })
    }

    // Validar horário se data, serviço ou barbeiro mudou
    const newDate = data.date ? new Date(data.date) : existingBooking.date
    const newBarberId = data.barberId !== undefined ? data.barberId : existingBooking.barberId
    const newServiceId = data.serviceId || existingBooking.serviceId

    if (data.date || data.barberId !== undefined || data.serviceId) {
      try {
        await validateBookingTime({
          date: newDate,
          serviceId: newServiceId,
          barberId: newBarberId,
          excludeBookingId: bookingId,
        })
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 422 })
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
    if (data.notes !== undefined && data.notes !== existingBooking.notes) {
      updateData.notes = data.notes
    }

    // Atualizar agendamento apenas se houver mudanças
    const updatedBooking = Object.keys(updateData).length > 0 
      ? await db.booking.update({
          where: { id: bookingId },
          data: updateData,
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            service: { select: { id: true, name: true, price: true, duration: true } },
            barber: { select: { id: true, name: true, userId: true } },
          },
        })
      : await db.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            service: { select: { id: true, name: true, price: true, duration: true } },
            barber: { select: { id: true, name: true, userId: true } },
          },
        })

    // Notificar cliente sobre mudanças
    if (updatedBooking && updateData.status && existingBooking.status !== data.status && data.status === 'CONFIRMED') {
      await notifyBookingConfirmed(
        updatedBooking.id,
        updatedBooking.user.id,
        updatedBooking.service.name
      )
    }
    
    if (updatedBooking && updateData.date && existingBooking.date.getTime() !== new Date(data.date).getTime()) {
      await notifyBookingUpdated(
        updatedBooking.id,
        updatedBooking.user.id,
        updatedBooking.service.name,
        updatedBooking.user.name || 'Cliente',
        updatedBooking.barber?.userId
      )
    }

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