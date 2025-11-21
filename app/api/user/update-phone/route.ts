import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { phone } = await req.json()

  await db.user.update({
    where: { id: session.user.id },
    data: { phone },
  })

  return NextResponse.json({ ok: true })
}
