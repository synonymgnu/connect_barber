import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { notifyBookingCancelled, notifyBookingConfirmed, notifyBookingUpdated } from '@/app/_lib/notifications/create-notification'
import { createAuditLog, getClientInfo } from '@/app/_lib/audit'
import { validateBookingTime } from '@/app/_lib/booking-validation'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const data = await request.json()

    const existingBooking = await db.booking.findFirst({
      where: { 
        id: params.id,
        service: { barbershopId: session.user.barbershopId! }
      }
    })

    if (!existingBooking) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const newDate = new Date(data.date)
    const newServiceId = data.serviceId || existingBooking.serviceId
    const newBarberId = data.barberId || existingBooking.barberId

    // Valida horário se data, serviço ou barbeiro mudou
    if (
      newDate.getTime() !== existingBooking.date.getTime() ||
      newServiceId !== existingBooking.serviceId ||
      newBarberId !== existingBooking.barberId
    ) {
      try {
        await validateBookingTime({
          date: newDate,
          serviceId: newServiceId,
          barberId: newBarberId,
          excludeBookingId: params.id,
        })
      } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 422 })
      }
    }

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        date: newDate,
        serviceId: newServiceId,
        barberId: newBarberId || null,
        status: data.status
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, price: true } },
        barber: { select: { id: true, name: true, userId: true } }
      }
    })

    // Notificar cliente sobre mudanças
    if (existingBooking.status !== data.status && data.status === 'CONFIRMED') {
      await notifyBookingConfirmed(
        updatedBooking.id,
        updatedBooking.user.id,
        updatedBooking.service.name
      )
    }
    
    if (existingBooking.date.getTime() !== new Date(data.date).getTime()) {
      await notifyBookingUpdated(
        updatedBooking.id,
        updatedBooking.user.id,
        updatedBooking.service.name,
        updatedBooking.user.name || 'Cliente',
        updatedBooking.barber?.userId
      )
    }

    const clientInfo = getClientInfo(request)
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_BOOKING',
      resource: 'booking',
      resourceId: params.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { oldStatus: existingBooking.status, newStatus: data.status }
    })

    return NextResponse.json(updatedBooking)
  } catch (error) {
    console.error('Error updating appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const existingBooking = await db.booking.findFirst({
      where: { 
        id: params.id,
        service: { barbershopId: session.user.barbershopId! }
      },
      include: {
        user: true,
        service: { include: { barbershop: true } },
        barber: true,
      },
    })

    if (!existingBooking) {
      return new NextResponse('Not Found', { status: 404 })
    }

    await notifyBookingCancelled(existingBooking, 'ADMIN')

    await db.booking.delete({
      where: { id: params.id }
    })

    const clientInfo = getClientInfo(request)
    await createAuditLog({
      userId: session.user.id,
      action: 'DELETE_BOOKING',
      resource: 'booking',
      resourceId: params.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { userId: existingBooking.userId, serviceId: existingBooking.serviceId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}