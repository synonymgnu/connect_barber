import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"



export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  const bookings = await db.booking.findMany({
    where: {
      barberId: session.user.barberId,
      date: { gte: new Date(start!), lte: new Date(end!) },
    },
    include: { user: true, service: true },
    orderBy: { date: "asc" },
  })

  return NextResponse.json(bookings)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "BARBER") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, status } = await req.json()
  await db.booking.update({ where: { id }, data: { status } })
  return NextResponse.json({ success: true })
}