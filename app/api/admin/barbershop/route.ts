import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'
import { createAuditLog } from '@/app/_lib/audit'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!barbershop) {
      return NextResponse.json({
        hasBarbershop: false,
        message: 'Admin não possui barbearia cadastrada',
      })
    }

    return NextResponse.json({
      hasBarbershop: true,
      barbershop,
    })
  } catch (error) {
    console.error('Erro ao verificar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const existingBarbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id },
    })

    if (existingBarbershop) {
      return NextResponse.json({
        message: 'Já possui barbearia',
        barbershop: existingBarbershop,
      })
    }

    const barbershop = await db.barbershop.create({
      data: {
        name: 'Minha Barbearia',
        address: 'Endereço da barbearia',
        phone: ['(11) 99999-9999'],
        description: 'Descrição da barbearia',
        images: [
          'https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3',
        ],
        ownerId: session.user.id,
      },
    })

    await createAuditLog({
      userId: session.user.id,
      action: 'CREATE_BARBERSHOP',
      resource: 'barbershop',
      resourceId: barbershop.id,
      metadata: { name: barbershop.name },
    })

    return NextResponse.json({
      message: 'Barbearia criada com sucesso',
      barbershop,
    })
  } catch (error) {
    console.error('Erro ao criar barbearia:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
