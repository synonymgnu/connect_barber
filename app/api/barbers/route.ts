import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'
import { hashEmail } from '@/app/_lib/encryption'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { name, email, phone, speciality, bio, instagram } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Nome e email são obrigatórios' },
        { status: 400 }
      )
    }

    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Admin não possui uma barbearia cadastrada' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { emailHash: hashEmail(email) },
      include: { barber: true },
    })

    let user

    if (existingUser) {
      // Bloqueia se o email já pertence a um ADMIN, MASTER ou já é BARBER vinculado a outro lugar
      if (existingUser.role === 'ADMIN' || existingUser.role === 'MASTER') {
        return NextResponse.json(
          {
            error:
              'Este email pertence a um administrador e não pode virar barbeiro',
          },
          { status: 400 }
        )
      }

      if (existingUser.barber) {
        return NextResponse.json(
          { error: 'Este usuário já é um barbeiro cadastrado' },
          { status: 400 }
        )
      }

      // Promove o CLIENT existente para BARBER
      user = await db.user.update({
        where: { id: existingUser.id },
        data: {
          role: 'BARBER',
          name: existingUser.name || name, // mantém o nome já existente, se houver
        },
      })
    } else {
      // Cria um novo usuário do zero
      user = await db.user.create({
        data: {
          name,
          email,
          role: 'BARBER',
          emailVerified: new Date(),
        },
      })
    }

    const barber = await db.barber.create({
      data: {
        name,
        email,
        phone: phone || null,
        speciality: speciality || null,
        bio: bio || null,
        instagram: instagram || null,
        userId: user.id,
        barbershopId: barbershop.id,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json(barber, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar barbeiro:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id },
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: 'Barbearia não encontrada' },
        { status: 404 }
      )
    }

    const barbers = await db.barber.findMany({
      where: { barbershopId: barbershop.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(barbers)
  } catch (error) {
    console.error('Erro ao buscar barbeiros:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
