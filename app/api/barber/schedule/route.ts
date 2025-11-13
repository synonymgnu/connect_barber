import { NextRequest, NextResponse } from "next/server"
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
    const schedule = await db.barberWorkSchedule.findMany({
      where: { barberId },
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(schedule)
  } catch (error) {
    console.error("Error fetching schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const barberId = session.user.barberId
  if (!barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  try {
    const scheduleData = await req.json()
    
    const result = await db.$transaction(async (tx) => {
      // remover horário existente
      await tx.barberWorkSchedule.deleteMany({
        where: { barberId }
      })

      const newSchedule = await Promise.all(
        scheduleData.map((daySchedule: { dayOfWeek: number; startTime: string; endTime: string; isActive?: boolean }) =>
          tx.barberWorkSchedule.create({
            data: {
              barberId,
              dayOfWeek: daySchedule.dayOfWeek,
              startTime: daySchedule.startTime,
              endTime: daySchedule.endTime,
              isActive: daySchedule.isActive !== false
            }
          })
        )
      )

      return newSchedule
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error updating schedule:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}