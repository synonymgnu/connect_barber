import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'
import { hashEmail } from '@/app/_lib/encryption'

interface ServiceInput {
  name: string
  description: string
  price: number
  duration: number
  imageUrl: string
}

interface SocialMediaInput {
  instagram?: string
  facebook?: string
  googleMaps?: string
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  if (session.user.role !== 'MASTER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const {
      // Dados da barbearia
      shopName,
      address,
      shopImageUrl,
      description,
      phone,
      // Redes Sociais
      socialMedia,
      // Formas de Pagamento
      paymentMethods,
      // Dados do dono (ADMIN)
      ownerName,
      ownerEmail,
      // Services (opcional)
      services,
    } = body as {
      shopName: string
      address: string
      shopImageUrl: string
      description: string
      phone: string[]
      socialMedia?: SocialMediaInput
      paymentMethods?: string[]
      ownerName: string
      ownerEmail: string
      services?: ServiceInput[]
    }

    // Validações básicas
    if (!shopName || !address || !shopImageUrl || !description) {
      return NextResponse.json(
        { error: 'Dados da barbearia incompletos' },
        { status: 400 }
      )
    }

    if (!ownerName || !ownerEmail) {
      return NextResponse.json(
        { error: 'Nome e email do dono são obrigatórios' },
        { status: 400 }
      )
    }

    // Validação de formas de pagamento
    if (!paymentMethods || paymentMethods.length === 0) {
      return NextResponse.json(
        { error: 'Selecione pelo menos uma forma de pagamento' },
        { status: 400 }
      )
    }

    // Validar se as formas de pagamento são válidas
    const validPaymentMethods = ['cash', 'pix', 'credit_card', 'debit_card']
    const isValidPaymentMethods = paymentMethods.every((method) =>
      validPaymentMethods.includes(method)
    )

    if (!isValidPaymentMethods) {
      return NextResponse.json(
        { error: 'Formas de pagamento inválidas' },
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { emailHash: hashEmail(ownerEmail) },
      include: { ownedBarbershop: true, barber: true },
    })

    if (existingUser) {
      if (existingUser.role === 'MASTER') {
        return NextResponse.json(
          { error: 'Este email pertence a um usuário master' },
          { status: 400 }
        )
      }

      if (existingUser.role === 'BARBER' || existingUser.barber) {
        return NextResponse.json(
          {
            error:
              'Este email pertence a um barbeiro e não pode virar dono de barbearia',
          },
          { status: 400 }
        )
      }

      if (existingUser.role === 'ADMIN' || existingUser.ownedBarbershop) {
        return NextResponse.json(
          {
            error: 'Este email já é dono de outra barbearia',
          },
          { status: 400 }
        )
      }
    }

    // NOTA: Neon pode "hibernar" e atrasar a primeira query da transação,
    // o que pode estourar o timeout padrão de 5s do Prisma. Se acontecer
    // em produção, considerar aumentar `timeout` aqui ou fazer um "ping"
    // de aquecimento antes de abrir a transação.
    const result = await db.$transaction(async (tx) => {
      let owner

      if (existingUser) {
        // Promove o CLIENT existente para ADMIN
        owner = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            role: 'ADMIN',
            name: existingUser.name || ownerName,
          },
        })
      } else {
        owner = await tx.user.create({
          data: {
            name: ownerName,
            email: ownerEmail,
            role: 'ADMIN',
            emailVerified: new Date(),
          },
        })
      }

      const barbershop = await tx.barbershop.create({
        data: {
          name: shopName,
          address,
          imageUrl: shopImageUrl,
          description,
          phone: phone?.length ? phone : [],
          // Redes Sociais
          instagram: socialMedia?.instagram || null,
          facebook: socialMedia?.facebook || null,
          googleMaps: socialMedia?.googleMaps || null,
          // Formas de Pagamento
          paymentMethods: paymentMethods || [],
          ownerId: owner.id,
          isActive: true,
        },
      })

      if (services?.length) {
        await tx.barbershopService.createMany({
          data: services.map((service) => ({
            name: service.name,
            description: service.description,
            price: service.price,
            duration: service.duration,
            imageUrl: service.imageUrl,
            barbershopId: barbershop.id,
          })),
        })
      }

      return { owner, barbershop }
    })

    const fullBarbershop = await db.barbershop.findUnique({
      where: { id: result.barbershop.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        services: true,
      },
    })

    return NextResponse.json(fullBarbershop, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar barbearia:', error)
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

  if (session.user.role !== 'MASTER') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  try {
    const barbershops = await db.barbershop.findMany({
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        services: true,
        _count: {
          select: { barbers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(barbershops)
  } catch (error) {
    console.error('Erro ao buscar barbearias:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
