import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const duration = Number(searchParams.get('duration') ?? 30)
    const todayStr = searchParams.get('todayStr')
    const nowMinutes = Number(searchParams.get('nowMinutes') ?? -1)

    if (!dateStr) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    // Parse date in local time to avoid UTC shift
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    // Range do dia em UTC considerando fuso UTC-3 (busca das 03:00 UTC até 02:59 UTC do dia seguinte)
    // Usa o offset enviado pelo cliente para ser preciso
    const tzOffsetMinutes = Number(searchParams.get('tzOffset') ?? 180) // Brasil = 180 (UTC-3)
    const tzOffsetMs = tzOffsetMinutes * 60 * 1000
    // meia-noite local = meia-noite UTC + offset
    // ex: 00:00 BRT = 03:00 UTC → Date.UTC(..., 0,0,0) + 3h
    const dayStartUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0) + tzOffsetMs)
    const dayEndUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59) + tzOffsetMs)

    const [barber, shopHours] = await Promise.all([
      db.barber.findUnique({
        where: { id: params.id },
        include: {
          workSchedule: { where: { dayOfWeek, isActive: true } },
          absences: {
            where: {
              date: { gte: dayStartUTC, lte: dayEndUTC },
            },
          },
          bookings: {
            where: {
              date: { gte: dayStartUTC, lte: dayEndUTC },
              status: { notIn: ['CANCELLED'] },
            },
            include: { service: { select: { duration: true } } },
          },
        },
      }),
      db.barbershopHours.findFirst({
        where: {
          barbershop: { barbers: { some: { id: params.id } } },
          dayOfWeek,
          isActive: true,
        },
      }),
    ])

    if (!barber) {
      return NextResponse.json({ error: 'Barbeiro não encontrado' }, { status: 404 })
    }

    // Barber is absent this day
    if (barber.absences.length > 0) {
      return NextResponse.json([])
    }

    const schedule = barber.workSchedule[0]
    if (!schedule) {
      return NextResponse.json([])
    }

    const [startH, startM] = schedule.startTime.split(':').map(Number)
    const [endH, endM] = schedule.endTime.split(':').map(Number)
    let startMinutes = startH * 60 + startM
    let endMinutes = endH * 60 + endM

    // Limita pelo horário de funcionamento da barbearia
    if (shopHours) {
      const [shH, shM] = shopHours.startTime.split(':').map(Number)
      const [ehH, ehM] = shopHours.endTime.split(':').map(Number)
      const shopStart = shH * 60 + shM
      const shopEnd = ehH * 60 + ehM
      startMinutes = Math.max(startMinutes, shopStart)
      endMinutes = Math.min(endMinutes, shopEnd)
    }

    // Build occupied intervals — booking.date está em UTC no banco
    // Converte para minutos do dia local usando o offset do cliente
    const occupied = barber.bookings.map((b) => {
      const utcMinutes = b.date.getUTCHours() * 60 + b.date.getUTCMinutes()
      const bookingStart = utcMinutes - tzOffsetMinutes
      const bookingDuration = b.service?.duration ?? 30
      return { start: bookingStart, end: bookingStart + bookingDuration }
    })

    const slots: string[] = []
    // isToday e nowMinutes já vêm calculados no fuso do cliente
    const isToday = todayStr === dateStr

    for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
      // Skip past slots for today
      if (isToday && nowMinutes >= 0) {
        if (m <= nowMinutes) continue
      }

      // Skip if overlaps with any existing booking
      const overlaps = occupied.some((o) => m < o.end && m + duration > o.start)
      if (overlaps) continue

      const h = String(Math.floor(m / 60)).padStart(2, '0')
      const min = String(m % 60).padStart(2, '0')
      slots.push(`${h}:${min}`)
    }

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Error fetching barber slots:', error)
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
  }
}
