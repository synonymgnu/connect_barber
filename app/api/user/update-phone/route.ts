import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function POST(req: Request) {
  const { userId, phone } = await req.json()

  await db.user.update({
    where: { id: userId },
    data: { phone },
  })

  return NextResponse.json({ ok: true })
}
