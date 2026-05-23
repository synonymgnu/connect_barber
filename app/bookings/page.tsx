import { getServerSession } from 'next-auth'
import Header from '../_components/header'
import { authOptions } from '../_lib/auth'
import { notFound } from 'next/navigation'
import { getConfirmedBookings } from '../_data/get-confirmed-bookings'
import { getConcludedBookings } from '../_data/get-concluded-bookings'
import BookingsClient from '../_components/bookings-client'

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    //TODO: mostrar pop-up de login
    return notFound()
  }

  const confirmedBookings = await getConfirmedBookings()
  const concludedBookings = await getConcludedBookings()

  return (
    <>
      <Header isHidden="md:flex" />
      <div className="space-y-3 px-5 pt-5 lg:pt-10 lg:px-64">
        <h1 className="font-bold text-xl md:text-2xl md:mb-2">Agendamentos</h1>

        {confirmedBookings.length === 0 && concludedBookings.length === 0 ? (
          <p className="text-gray-400">Você não tem agendamentos.</p>
        ) : (
          <div className="md:flex md:gap-10">
            <div className="flex-1 space-y-3">
              <BookingsClient
                confirmedBookings={confirmedBookings}
                concludedBookings={concludedBookings}
              />
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Bookings
