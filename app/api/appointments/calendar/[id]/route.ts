import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await req.json()
    const { id } = params

    const existingBooking = await db.booking.findFirst({
      where: { 
        id,
        ...(session.user.role === "BARBER" 
          ? { barberId: session.user.barberId || undefined }
          : { service: { barbershopId: session.user.barbershopId || undefined } }
        ),
      },
      include: { service: true },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    // Verifica conflito de horário (exceto se for o mesmo agendamento)
    const conflictBooking = await db.booking.findFirst({
      where: {
        id: { not: id },
        barberId: data.barberId || existingBooking.barberId,
        date: new Date(data.date),
        status: { not: "CANCELLED" },
      },
    })

    if (conflictBooking) {
      return NextResponse.json({ error: "Horário indisponível" }, { status: 409 })
    }

    const updatedBooking = await db.booking.update({
      where: { id },
      data: {
        date: new Date(data.date),
        serviceId: data.serviceId,
        barberId: data.barberId || existingBooking.barberId,
        status: data.status,
      },
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = params

    const existingBooking = await db.booking.findFirst({
      where: { 
        id,
        ...(session.user.role === "BARBER" 
          ? { barberId: session.user.barberId || undefined }
          : { service: { barbershopId: session.user.barbershopId || undefined } }
        ),
      },
    })

    if (!existingBooking) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    await db.booking.delete({ where: { id } })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error("Error deleting appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}