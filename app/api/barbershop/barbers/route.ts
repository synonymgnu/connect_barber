import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    if (!session?.user?.barbershopId) {
      return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
    }

    const barbers = await db.barber.findMany({
      where: { 
        barbershopId: session.user.barbershopId, 
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        user: {
          select: {
            image: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(barbers)
  } catch (error) {
    console.error('Error fetching barbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}