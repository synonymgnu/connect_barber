import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const barberId = session.user.barberId
  if (!barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const period = searchParams.get("period") || "week"

  try {

    const now = new Date()
    const startDate = new Date()
    
    switch (period) {
      case "day":
        startDate.setHours(0, 0, 0, 0)
        break
      case "week":
        startDate.setDate(now.getDate() - 7)
        break
      case "month":
        startDate.setMonth(now.getMonth() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    const [bookings, ratings] = await Promise.all([
      
      db.booking.findMany({
        where: {
          barberId,
          date: { gte: startDate }
        },
        include: {
          service: true
        }
      }),
      
      db.rating.findMany({
        where: {
          booking: { barberId }
        }
      })
    ])

    const total = bookings.length
    const completed = bookings.filter(b => b.status === "COMPLETED").length
    const cancelled = bookings.filter(b => b.status === "CANCELLED").length
    
    // receita dos serviços completados
    const revenue = bookings
      .filter(b => b.status === "COMPLETED")
      .reduce((sum, booking) => sum + Number(booking.service.price), 0)

    // média de avaliações
    const avgRating = ratings.length > 0 
      ? ratings.reduce((sum, r) => sum + r.value, 0) / ratings.length 
      : 0

    return NextResponse.json({
      total,
      completed,
      cancelled,
      revenue,
      avgRating
    })

  } catch (error) {
    console.error("Error fetching barber stats:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}