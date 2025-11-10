import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"



// [ GET ] -> Lista barbeiros da barbearia
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const barbershop = await db.barbershop.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!barbershop) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })
    }

    const barbers = await db.barber.findMany({
      where: { barbershopId: barbershop.id },
      include: { user: true },
    })

    return NextResponse.json(barbers)

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Erro ao buscar barbeiros" },
      { status: 500 }
    )
  }
}

// POST - Cria novo barbeiro
export async function POST(req: NextRequest) {
  
  try {

    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // Verifica se o email já existe
    const existingUser = await db.user.findUnique({
      where: { email: body.email },
    })

    let user

    if (existingUser) {
      // Se usuário existe, atualiza role para BARBER
      user = await db.user.update({
        where: { id: existingUser.id },
        data: { role: "BARBER" },
      })
    } else {
      // Cria novo usuário
      user = await db.user.create({
        data: {
          email: body.email,
          name: body.name,
          role: "BARBER",
        },
      })
    }

    // Obtém a barbearia do admin
    const barbershop = await db.barbershop.findUnique({
      where: { ownerId: session.user.id },
    })

    if (!barbershop) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })
    }

    // Cria barbeiro
    const barber = await db.barber.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        imageUrl: body.imageUrl,
        userId: user.id,
        barbershopId: barbershop.id,
      },
    })

    return NextResponse.json(barber, { status: 201 })

  } catch (error) {
    console.error(error)
    
    return NextResponse.json(
      { error: "Erro ao criar barbeiro" },
      { status: 500 }
    )
  }
}