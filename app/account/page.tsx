import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import Header from '../_components/header'
import AccountInfo from '../_components/account/account-info'
import BarberProfileSection from '../_components/account/barber-profile-section'
import { db } from '../_lib/prisma'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/')
  }

  const user = session.user

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { date: 'desc' },
  })

  let barberStatus: 'ACTIVE' | 'INACTIVE' | null = null
  let barbershop: {
    id: string
    name: string
    address: string
    images: string[]
  } | null = null

  if (user.role === 'BARBER') {
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
      select: { isActive: true, barbershopId: true },
    })
    barberStatus = barber?.isActive ? 'ACTIVE' : 'INACTIVE'

    if (barber?.barbershopId) {
      barbershop = await db.barbershop.findUnique({
        where: { id: barber.barbershopId },
        select: { id: true, name: true, address: true, images: true },
      })
    }
  }

  if (user.role === 'ADMIN') {
    barbershop = await db.barbershop.findUnique({
      where: { ownerId: user.id },
      select: { id: true, name: true, address: true, images: true },
    })
  }

  return (
    <>
      <Header />

      <div className="flex flex-col gap-6 px-5 pt-5 lg:pt-16 lg:px-32">
        <AccountInfo
          user={user}
          bookings={bookings}
          barberStatus={barberStatus}
          barbershop={barbershop}
        />
        {user.role === 'BARBER' && <BarberProfileSection />}
      </div>
    </>
  )
}
