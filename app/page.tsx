import Header from "./_components/header"
import { Button } from "./_components/ui/button"
import Image from "next/image"
import { db } from "./_lib/prisma"
import BarbershopItem from "./_components/barbershop-item"
import { Barbershop } from "./generated/prisma"
import { quickSearchOptions } from "./_constants/search"
import BookingItem from "./_components/booking-item"
import ButtonIcon from "./_components/button-icon"
import Search from "./_components/search"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "./_lib/auth"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"


const Home = async () => {
  const session = await getServerSession(authOptions)
  const barbershops = await db.barbershop.findMany({})
  const popularBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: "desc",
    },
    distinct: ["id"], // garante que não duplica
  })

  const mostVisitedBarbershops = await db.barbershop.findMany({
    orderBy: {
      name: "asc",
    },
    distinct: ["id"], // garante que não duplica
  })
  const confirmedBookings = session?.user ? await db.booking.findMany({
    where: {
      userId: (session.user as any).id,
      date: {
        gte: new Date(),
      }
    },
    include: {
      service: {
        include: {
          barbershop: true
        }
      }
    }
  }) : []

  return (
    <div>
      {/* header */}
      <Header />
      <div className="p-5 lg:pt-16 lg:px-32">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-32">
        {/* LADO ESQUERDO */}
        <div className="lg:w-2/4">
        {/* TEXTO */}
        <h2 className="text-xl font-bold lg:text-2xl">Olá, {session?.user ? session.user.name : "bem vindo"}!</h2>
       <p> 
       <span className="capitalize">
       {format(new Date(), "EEEE, dd", {locale: ptBR})}
       </span>
       <span>&nbsp;de&nbsp;</span>
       <span className="capitalize">
       {format(new Date(), "MMMM", {locale: ptBR})}
       </span>
       </p>


        {/* BUSCA */}
        <div className="mt-6">
          <Search />
        </div>

        {/* BUSCA RÁPIDA */}
        <div className="md:hidden mt-6 flex gap-3 overflow-x-scroll [&::-webkit-scrollbar]:hidden">
          {quickSearchOptions.map((option) => (
            <Button className="gap-2" 
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
            <BookingItem key={booking.id} booking={JSON.parse(JSON.stringify(booking))} />
          ))}
        </div>
        </>
        )}
       </div>

       {/* LADO DIREITO */}
       <div className="lg:w-2/4 mt-8 lg:mt-0">
        <div className="relative">
        <h2 className="mb-3 text-xs font-bold uppercase text-gray-400">
          Recomendados
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop: Barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
        <ButtonIcon />
       </div>
       </div>
       </div>
        <div className="relative">
        <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Populares
        </h2>
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {popularBarbershops.map((barbershop: Barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
        <ButtonIcon />
        </div>
        <div className="relative">
        <h2 className="hidden md:block mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
          Mais Visitados
        </h2>
        <div className="hidden md:block">
        <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {mostVisitedBarbershops.map((barbershop: Barbershop) => (
            <BarbershopItem key={barbershop.id} barbershop={barbershop} />
          ))}
        </div>
      </div>
      <ButtonIcon />
      </div>
      </div>
      

    </div>
  )
}

export default Home
