import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const barbershop = await db.barbershop.findUnique({
      where: { ownerId: session.user.id },
      include: {
        owner: true,
      },
    })

    if (!barbershop) {
      return NextResponse.json({ error: "Barbearia não encontrada" }, { status: 404 })
    }

    return NextResponse.json(barbershop, {
      headers: {
        'Cache-Control': 'private, max-age=300, stale-while-revalidate=150',
      }
    })
  } catch (error) {
    console.error("[BARBERSHOP_SETTINGS_ERROR]", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await req.json()
    
    const barbershop = await db.barbershop.update({
      where: { ownerId: session.user.id },
      data: {
        name: body.name,
        address: body.address,
        description: body.description,
        imageUrl: body.imageUrl,
        phone: body.phones.filter((p: string) => p.trim() !== ""),
      },
    })

    return NextResponse.json(barbershop)
  } catch (error) {
    console.error("[BARBERSHOP_SETTINGS_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao atualizar barbearia" },
      { status: 500 }
    )
  }
}

// POST para criar barbearia (primeira vez)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verifica se usuário já tem barbearia
    const existing = await db.barbershop.findUnique({
      where: { ownerId: session.user.id },
    })

    if (existing) {
      return NextResponse.json(
        { error: "Barbearia já existe" },
        { status: 400 }
      )
    }

    const body = await req.json()
    
    const barbershop = await db.barbershop.create({
      data: {
        name: body.name,
        address: body.address,
        description: body.description,
        imageUrl: body.imageUrl,
        phone: body.phones.filter((p: string) => p.trim() !== ""),
        ownerId: session.user.id,
      },
    })

    return NextResponse.json(barbershop, { status: 201 })
  } catch (error) {
    console.error("[BARBERSHOP_SETTINGS_ERROR]", error)
    return NextResponse.json(
      { error: "Erro ao criar barbearia" },
      { status: 500 }
    )
  }
}