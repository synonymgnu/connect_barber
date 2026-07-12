import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createAuditLog, getClientInfo } from '@/app/_lib/audit'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barbershop = await db.barbershop.findUnique({
      where: { ownerId: session.user.id },
      include: {
        owner: true,
      },
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(barbershop, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
      },
    })
  } catch (error) {
    console.error('[BARBERSHOP_SETTINGS_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()

    const barbershop = await db.barbershop.update({
      where: { ownerId: session.user.id },
      data: {
        name: body.name,
        address: body.address,
        description: body.description,
        images: body.images?.filter((img: string) => img.trim() !== '') ?? [],
        phone: body.phones.filter((p: string) => p.trim() !== ''),
      },
    })

    const clientInfo = getClientInfo(req)
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_BARBERSHOP',
      resource: 'barbershop',
      resourceId: barbershop.id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { name: body.name, address: body.address },
    })

    return NextResponse.json(barbershop)
  } catch (error) {
    console.error('[BARBERSHOP_SETTINGS_ERROR]', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar barbearia' },
      { status: 500 }
    )
  }
}

// POST para criar barbearia — bloqueado: apenas MASTER pode criar via /api/master/barbershops
export async function POST() {
  return NextResponse.json(
    { error: 'Não autorizado. Use o painel master para criar barbearias.' },
    { status: 403 }
  )
}
