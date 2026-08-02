import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.barberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const barber = await db.barber.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(barber)
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user.barberId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const data = await req.json()

  const updated = await db.barber.update({
    where: { userId: session.user.id },
    data,
  })

  return NextResponse.json(updated)
}
