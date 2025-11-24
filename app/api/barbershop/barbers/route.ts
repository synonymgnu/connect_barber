import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const barbershopId = session.user.barbershopId || 
      (await db.barbershop.findFirst({ where: { ownerId: session.user.id } }))?.id

    if (!barbershopId) {
      return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })
    }

    const barbers = await db.barber.findMany({
      where: { barbershopId, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(barbers, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
      }
    })
  } catch (error) {
    console.error("Error fetching barbers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}