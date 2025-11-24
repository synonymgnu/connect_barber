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
    let barbershopId = session.user.barbershopId
    
    // Se for admin, buscar pela propriedade
    if (!barbershopId && session.user.role === "ADMIN") {
      const barbershop = await db.barbershop.findFirst({ where: { ownerId: session.user.id } })
      barbershopId = barbershop?.id
    }
    
    // Se for barbeiro, buscar pela relação
    if (!barbershopId && session.user.role === "BARBER") {
      const barber = await db.barber.findFirst({ 
        where: { userId: session.user.id },
        select: { barbershopId: true }
      })
      barbershopId = barber?.barbershopId
    }

    if (!barbershopId) {
      return NextResponse.json({ error: "Barbershop not found" }, { status: 404 })
    }

    const services = await db.barbershopService.findMany({
      where: { barbershopId },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(services, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
      }
    })
  } catch (error) {
    console.error("Error fetching services:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}