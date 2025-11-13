import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    const { name, email, phone, imageUrl, speciality, bio, instagram, isActive } = await req.json()

    // Buscar o barbeiro
    const barber = await db.barber.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!barber) {
      return NextResponse.json({ error: "Barbeiro não encontrado" }, { status: 404 })
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!barbershop || barber.barbershopId !== barbershop.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Verificar se o email já está em uso por outro usuário
    if (email && email !== barber.email) {
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser && existingUser.id !== barber.userId) {
        return NextResponse.json(
          { error: "Email já está em uso por outro usuário" }, 
          { status: 400 }
        )
      }
    }

    // Atualizar o usuário
    await db.user.update({
      where: { id: barber.userId },
      data: {
        name,
        email,
        image: imageUrl,
      }
    })

    // Atualizar o barbeiro
    const updatedBarber = await db.barber.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone: phone || null,
        imageUrl: imageUrl || null,
        speciality: speciality || null,
        bio: bio || null,
        instagram: instagram || null,
        isActive: isActive !== undefined ? isActive : barber.isActive
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

    return NextResponse.json(updatedBarber)

  } catch (error) {
    console.error("Erro ao atualizar barbeiro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
  }

  try {
    // Buscar o barbeiro
    const barber = await db.barber.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!barber) {
      return NextResponse.json({ error: "Barbeiro não encontrado" }, { status: 404 })
    }

    // Verificar se o barbeiro pertence à barbearia do admin
    const barbershop = await db.barbershop.findFirst({
      where: { ownerId: session.user.id }
    })

    if (!barbershop || barber.barbershopId !== barbershop.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Deletar o barbeiro e o usuário associado
    await db.$transaction([
      db.barber.delete({
        where: { id: params.id }
      }),
      db.user.delete({
        where: { id: barber.userId }
      })
    ])

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Erro ao deletar barbeiro:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}