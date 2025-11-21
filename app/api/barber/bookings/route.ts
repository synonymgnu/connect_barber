import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { createAuditLog, getClientInfo } from "@/app/_lib/audit"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.barberId) {
    console.error("Barber ID not found in session")
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const startParam = searchParams.get("start")
    const endParam = searchParams.get("end")

    if (!startParam || !endParam) {
      return NextResponse.json(
        { error: "Start and end dates are required" }, 
        { status: 400 }
      )
    }

    const start = new Date(startParam)
    const end = new Date(endParam)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: "Invalid date format. Use ISO 8601 format" }, 
        { status: 400 }
      )
    }

    const bookings = await db.booking.findMany({
      where: {
        barberId: session.user.barberId,
        date: { 
          gte: start, 
          lte: end 
        },
      },
      include: { 
        user: { select: { id: true, name: true, email: true } }, 
        service: { select: { id: true, name: true, price: true, duration: true } } 
      },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json(
      { error: "Failed to fetch bookings" }, 
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  try {
    const { id, status } = await req.json()
    
    if (!id || !status) {
      return NextResponse.json(
        { error: "ID and status are required" }, 
        { status: 400 }
      )
    }

    const booking = await db.booking.findFirst({
      where: { 
        id,
        barberId: session.user.barberId 
      }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    const updated = await db.booking.update({ 
      where: { id }, 
      data: { status } 
    })
    
    const clientInfo = getClientInfo(req)
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_BOOKING_STATUS',
      resource: 'booking',
      resourceId: id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { oldStatus: booking.status, newStatus: status }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Failed to update booking" }, 
      { status: 500 }
    )
  }
}