import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { name, email, phone, imageUrl, speciality, bio, instagram } = await req.json()

    console.log("Dados recebidos:", { name, email, phone })

    if (!name || !email) {
      return NextResponse.json(
        { error: "Nome e email são obrigatórios" }, 
        { status: 400 }
      )
    }

    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Já existe um usuário com este email" }, 
        { status: 400 }
      )
    }

    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!barbershop) {
      return NextResponse.json(
        { error: "Admin não possui uma barbearia cadastrada" }, 
        { status: 400 }
      )
    }

    console.log("Barbearia encontrada:", barbershop.id)

    const user = await db.user.create({
      data: {
        name,
        email,
        role: "BARBER",
        image: imageUrl,
        emailVerified: new Date(),
      }
    })

    console.log("Usuário criado:", user.id)

    const barber = await db.barber.create({
      data: {
        name,
        email,
        phone: phone || null,
        imageUrl: imageUrl || null,
        speciality: speciality || null,
        bio: bio || null,
        instagram: instagram || null,
        userId: user.id,
        barbershopId: barbershop.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        }
      }
    })

    console.log("Barbeiro criado com sucesso:", barber.id)

    return NextResponse.json(barber)

  } catch (error) {
    console.error("Erro ao criar barbeiro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!barbershop) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })
    }

    const barbers = await db.barber.findMany({
      where: { barbershopId: barbershop.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(barbers)

  } catch (error) {
    console.error("Erro ao buscar barbeiros:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}