import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { notifyBookingCancelled } from '@/app/_lib/notifications/create-notification'

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

    const updatedBooking = await db.booking.update({
      where: { id: params.id },
      data: {
        date: new Date(data.date),
        serviceId: data.serviceId,
        barberId: data.barberId || null,
        status: data.status
      },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        service: { select: { id: true, name: true, price: true } },
        barber: { select: { id: true, name: true } }
      }
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

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}