import { NextResponse } from 'next/server'
import { db } from '@/app/_lib/prisma'

export const dynamic = 'force-dynamic'

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
      include: {
        Rating: {
          select: { value: true },
        },
        bookings: {
          select: {
            ratings: {
              select: { value: true },
            },
          },
        },
      },
    })

    const barbersWithAvg = barbers.map((barber) => {
      const { Rating, bookings, ...rest } = barber

      // Ratings diretas do barbeiro (barberId preenchido)
      const directRatings = Rating.map((r) => r.value)

      // Ratings via bookings do barbeiro (quando barberId na Rating é null)
      const bookingRatings = bookings.flatMap((b) =>
        b.ratings.map((r) => r.value)
      )

      // Prioriza diretas, se não, usa as dos bookings
      const allRatings =
        directRatings.length > 0 ? directRatings : bookingRatings

      const averageRating =
        allRatings.length > 0
          ? allRatings.reduce((sum, v) => sum + v, 0) / allRatings.length
          : null

      return { ...rest, averageRating }
    })

    return NextResponse.json(barbersWithAvg)
  } catch (error) {
    console.error('Erro ao carregar barbeiros ativos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar barbeiros' },
      { status: 500 }
    )
  }
}
