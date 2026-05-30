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

    // Build shop-level schedule: for each day, collect hours from all barbers that work that day
    const shopScheduleMap: Record<number, { startTime: string; endTime: string }[]> = {}
    for (const barber of barbers) {
      for (const s of barber.workSchedule) {
        if (!shopScheduleMap[s.dayOfWeek]) shopScheduleMap[s.dayOfWeek] = []
        shopScheduleMap[s.dayOfWeek].push({ startTime: s.startTime, endTime: s.endTime })
      }
    }

    // For each active day, pick earliest start and latest end
    const shopSchedule = Object.entries(shopScheduleMap).map(([day, entries]) => ({
      dayOfWeek: Number(day),
      startTime: entries.reduce((min, e) => e.startTime < min ? e.startTime : min, entries[0].startTime),
      endTime: entries.reduce((max, e) => e.endTime > max ? e.endTime : max, entries[0].endTime),
    }))

    return NextResponse.json({
      barbers: barbers.map(b => ({
        id: b.id,
        name: b.name,
        workSchedule: b.workSchedule,
        absences: b.absences
      })),
      shopClosures,
      shopSchedule,
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    return NextResponse.json({ error: 'Erro ao carregar disponibilidade' }, { status: 500 })
  }
}
