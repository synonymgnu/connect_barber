import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'
import { startOfDay, endOfDay, set } from 'date-fns'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const dateStr = searchParams.get('date')
    const duration = Number(searchParams.get('duration') ?? 30)

    if (!dateStr) {
      return NextResponse.json({ error: 'date is required' }, { status: 400 })
    }

    const date = new Date(`${dateStr}T12:00:00`)
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
    // Use UTC offset to convert stored UTC time back to local time
    const tzOffsetMinutes = new Date().getTimezoneOffset()
    const occupied = barber.bookings.map((b) => {
      const bookingStartUTC = b.date.getUTCHours() * 60 + b.date.getUTCMinutes()
      const bookingStart = bookingStartUTC - tzOffsetMinutes
      const bookingDuration = b.service?.duration ?? 30
      return { start: bookingStart, end: bookingStart + bookingDuration }
    })

    const slots: string[] = []
    const now = new Date()
    const toLocalDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const isToday = toLocalDateStr(date) === toLocalDateStr(now)

    for (let m = startMinutes; m + duration <= endMinutes; m += 30) {
      // Skip past slots for today
      if (isToday) {
        const slotDate = set(date, {
          hours: Math.floor(m / 60),
          minutes: m % 60,
          seconds: 0,
        })
        if (slotDate <= now) continue
      }

      // Skip if overlaps with any existing booking
      const overlaps = occupied.some((o) => m < o.end && m + duration > o.start)
      if (overlaps) continue

      const h = String(Math.floor(m / 60)).padStart(2, '0')
      const min = String(m % 60).padStart(2, '0')
      slots.push(`${h}:${min}`)
    }

    return NextResponse.json({
      slots,
      debug: {
        dateStr,
        dayOfWeek,
        scheduleFound: !!schedule,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        startMinutes,
        endMinutes,
        duration,
        isToday,
        bookingsCount: barber.bookings.length,
      }
    })
  } catch (error) {
    console.error('Error fetching barber slots:', error)
    return NextResponse.json({ error: 'Erro ao buscar horários' }, { status: 500 })
  }
}
