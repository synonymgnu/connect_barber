import { Button } from './_components/ui/button'
import Image from 'next/image'
import { db } from './_lib/prisma'
import { quickSearchOptions } from './_constants/search'
import BookingItem from './_components/booking-item'
import Search from './_components/search'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from './_lib/auth'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { getConfirmedBookings } from './_data/get-confirmed-bookings'
import Header from './_components/header'
import BarbershopCarousel from './_components/barbershop-carousel'

const Home = async () => {
  const session = await getServerSession(authOptions)
  const barbershops = await db.barbershop.findMany({})
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: 'desc',
    },
    distinct: ['id'], // garante que não duplica
  })

  const mostVisitedBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: 'asc',
    },
    distinct: ['id'], // garante que não duplica
  })
  const confirmedBookings = await getConfirmedBookings()

  return (
    <div>
      {/* header */}
      <Header />
      <div className="px-5 pt-5 lg:pt-16 lg:px-32">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-32">
          {/* LADO ESQUERDO */}
          <div className="lg:w-2/4 max-h-screen overflow-y-auto">
            {/* TEXTO */}
            <h2 className="text-xl font-bold lg:text-2xl">
              Olá, {session?.user ? session.user.name : 'bem vindo'}!
            </h2>
            <p>
              <span className="capitalize">
                {format(new Date(), 'EEEE, dd', { locale: ptBR })}
              </span>
              <span>&nbsp;de&nbsp;</span>
              <span className="capitalize">
                {format(new Date(), 'MMMM', { locale: ptBR })}
              </span>
            </p>

            {/* BUSCA */}
            <div className="mt-6 ml-[2px]">
              <Search />
            </div>

            {/* BUSCA RÁPIDA */}
            <div className="md:hidden mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
              {quickSearchOptions.map((option) => (
                <Button
                  className="gap-2"
                  variant="secondary"
                  key={option.title}
                  asChild
                >
                  <Link href={`/barbershops?service=${option.title}`}>
                    <Image
                      src={option.imageUrl}
                      alt={option.title}
                      width={16}
                      height={16}
                    />
                    {option.title}
                  </Link>
                </Button>
              ))}
            </div>

            {/* IMAGEM */}
            <div className="relative mt-6 h-[150px] w-full md:hidden">
              <Image
                alt="Agende nos melhores com Connect Barber"
                src="/banner-02.png"
                fill
                className="rounded-xl object-cover"
              />
            </div>

            {confirmedBookings.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                  Agendamentos
                </h2>

                {/* AGENDAMENTO */}
                <div className="flex overflow-x-auto gap-3 [&::-webkit-scrollbar]:hidden">
                  {confirmedBookings.map((booking) => (
                    <BookingItem
                      key={booking.id}
                      booking={JSON.parse(JSON.stringify(booking))}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* LADO DIREITO */}
          <div className="lg:w-2/4 mt-8 lg:mt-0 flex-grow">
            <div className="relative">
              <BarbershopCarousel
                title="Recomendados"
                barbershops={barbershops}
              />
            </div>
          </div>
        </div>

        <div className="relative mt-6">
          <BarbershopCarousel
            title="Populares"
            barbershops={popularBarbershops}
          />
        </div>

        <div className="relative mt-10 hidden lg:block">
          <BarbershopCarousel
            title="Mais Visitados"
            barbershops={mostVisitedBarbershops}
          />
        </div>
      </div>
    </div>
  )
}

export default Home
