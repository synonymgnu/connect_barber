import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'BARBER') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const barber = await db.barber.findFirst({
      where: { userId: session.user.id }
    })

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
    }

    const absence = await db.barberAbsence.findFirst({
      where: {
        id: params.id,
        barberId: barber.id
      }
    })

    if (!absence) {
      return NextResponse.json({ error: 'Ausência não encontrada' }, { status: 404 })
    }

    await db.barberAbsence.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting barber absence:', error)
    return NextResponse.json({ error: 'Erro ao excluir ausência' }, { status: 500 })
  }
}