// app/api/user/update-phone/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId, phone } = await req.json()

  // Garante que apenas o próprio usuário (ou MASTER/ADMIN) pode alterar
  if (
    session.user.id !== userId &&
    !['MASTER', 'ADMIN'].includes(session.user.role)
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const numeric = phone.replace(/\D/g, '')

  // phone vazio = remoção; deve ter exatamente 11 dígitos caso preenchido
  if (numeric !== '' && numeric.length !== 11) {
    return NextResponse.json({ error: 'Invalid phone' }, { status: 400 })
  }

  await db.user.update({
    where: { id: userId },
    data: {
      // Salva null quando vazio (campo opcional no schema)
      phone: numeric === '' ? null : phone,
    },
  })

  return NextResponse.json({ ok: true })
}
