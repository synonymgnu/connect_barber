import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const barbershopId = params.id

    const barbers = await db.barber.findMany({
      where: { barbershopId },
      include: {
        workSchedule: true,
        absences: {
          where: {
            date: {
              gte: new Date()
            }
          }
        }
      }
    })

    const shopClosures = await db.barberAbsence.findMany({
      where: {
        barberId: null,
        date: {
          gte: new Date()
        }
      }
    })

    return NextResponse.json({
      barbers: barbers.map(b => ({
        id: b.id,
        name: b.name,
        workSchedule: b.workSchedule,
        absences: b.absences
      })),
      shopClosures
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Erro ao carregar disponibilidade' }, { status: 500 })
  }
}
