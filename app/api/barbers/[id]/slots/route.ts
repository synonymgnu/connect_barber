import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { startOfDay, endOfDay } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const duration = Number(searchParams.get('duration') ?? 30)
    const nowParam = searchParams.get('now') // horário atual do cliente (ISO string)

    if (!dateStr) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    // Parse date in local time to avoid UTC shift
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)
    const dayOfWeek = date.getDay()

    const barber = await db.barber.findUnique({
      where: { id: params.id },
      include: {
        workSchedule: { where: { dayOfWeek, isActive: true } },
        absences: {
          where: {
            date: { gte: startOfDay(date), lte: endOfDay(date) },
          },
        },
        bookings: {
          where: {
            date: { gte: startOfDay(date), lte: endOfDay(date) },
          },
          include: { service: { select: { duration: true } } },
        },
      },
    })

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
    const startMinutes = startH * 60 + startM
    const endMinutes = endH * 60 + endM

    // Build occupied intervals from existing bookings
    const occupied = barber.bookings.map((b) => {
      const bookingStart = b.date.getHours() * 60 + b.date.getMinutes()
      const bookingDuration = b.service?.duration ?? 30
      return { start: bookingStart, end: bookingStart + bookingDuration }
    })

    const slots: string[] = []
    // Usa o horário do cliente se fornecido, caso contrário usa o servidor
    const now = nowParam ? new Date(nowParam) : new Date()
    const toLocalDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    // Compara a data solicitada com a data atual do cliente
    const isToday = dateStr === toLocalDateStr(now)

    for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
      // Skip past slots for today
      if (isToday) {
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
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
