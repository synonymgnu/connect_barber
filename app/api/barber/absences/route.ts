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
    const absences = await db.barberAbsence.findMany({
      where: { 
        barberId,
        date: { gte: new Date() }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json(absences)
  } catch (error) {
    console.error("Error fetching absences:", error)
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
    const { date, reason, isAllDay = true } = await req.json()

    const absence = await db.barberAbsence.create({
      data: {
        barberId,
        date: new Date(date),
        reason,
        isAllDay
      }
    })

    return NextResponse.json(absence)
  } catch (error) {
    console.error("Error creating absence:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const barberId = session.user.barberId
  if (!barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Absence ID required" }, { status: 400 })
    }

    await db.barberAbsence.delete({
      where: { id, barberId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting absence:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}