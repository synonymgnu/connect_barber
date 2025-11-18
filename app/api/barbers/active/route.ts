import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const barbershopId = searchParams.get('barbershopId')

    const barbers = await db.barber.findMany({
      where: {
        isActive: true,
        ...(barbershopId ? { barbershopId } : {}),
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(barbers)
  } catch (error) {
    console.error('Erro ao carregar barbeiros ativos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar barbeiros' },
      { status: 500 }
    )
  }
}
