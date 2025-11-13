import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const barberId = session.user.barberId
  if (!barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  try {
    const ratings = await db.rating.findMany({
      where: {
        booking: { barberId }
      },
      include: {
        user: {
          select: {
            name: true,
            image: true
          }
        },
        booking: {
          include: {
            service: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const reviews = ratings.map(rating => ({
      id: rating.id,
      value: rating.value,
      clientName: rating.user.name,
      clientImage: rating.user.image,
      serviceName: rating.booking.service.name,
      date: rating.createdAt
    }))

    return NextResponse.json(reviews)

  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}