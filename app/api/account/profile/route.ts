import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { name } = await req.json()

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Nome inválido' }, { status: 400 })
  }

  const updated = await db.user.update({
    where: { id: session.user.id },
    data: { name: name.trim() },
  })

  return NextResponse.json(updated)
}
