import { db } from '@/app/_lib/prisma'
import { ChevronLeftIcon, MapPinIcon, StarIcon } from 'lucide-react'
import Image from 'next/image'
import { Button } from '../../_components/ui/button'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ServiceItem from '@/app/_components/service-item'
import PhoneItem from '@/app/_components/phone-item'
import { Sheet, SheetTrigger } from '@/app/_components/ui/sheet'
import SidebarSheet from '@/app/_components/sidebar-sheet'
import Header from '@/app/_components/header'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Avatar, AvatarImage } from '@/app/_components/ui/avatar'

interface BarbershopPageProps {
  params: {
    id: string
  }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {
  const barbershop = await db.barbershop.findUnique({
    where: {
      id: params.id,
    },
    include: {
      services: true,
      ratings: true,
    },
  })

  if (!barbershop) {
    return notFound()
  }

  const averageRating =
    barbershop.ratings.length > 0
      ? barbershop.ratings.reduce((acc, rating) => acc + rating.value, 0) /
        barbershop.ratings.length
      : 0

  const totalRatings = barbershop.ratings.length

  type InstagramIconProps = {
    className?: string
  }

  const InstagramIcon = ({ className }: InstagramIconProps) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 0 000-2.881z" />
    </svg>
  )

  return (
    <div>
      <div className="hidden md:block">
        <Header isHidden="md:flex" />
      </div>

      {/* CONTAINER GERAL */}
      <div className="lg:flex lg:gap-8 lg:ml-32 lg:mr-32 lg:mt-10 lg:min-w-[758px]">
        {/* COLUNA ESQUERDA */}
        <div className="lg:w-3/4">
          {/* IMAGEM */}
          <div className="relative h-[250px] w-full lg:h-[487px] overflow-hidden">
            <Image
              alt={barbershop.name}
              src={barbershop?.imageUrl}
              fill
              className="object-cover md:rounded-lg"
            />

            <Button
              size="icon"
              variant="secondary"
              className="absolute left-4 top-4 md:hidden"
              asChild
            >
              <Link href="/">
                <ChevronLeftIcon />
              </Link>
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  className="absolute right-4 top-4 md:hidden"
                  asChild
                >
                  <div>
                    <SidebarSheet />
                  </div>
                </Button>
              </SheetTrigger>
            </Sheet>
          </div>
          {/* NOME, ENDEREÇO E AVALIAÇÃO */}
          <div className="p-5 border-b  lg:flex lg:items-center lg:justify-between lg:p-0 lg:mt-5 lg:border-b-0">
            {/* BLOCO ESQUERDA */}
            <div>
              <h1 className="text-xl font-bold mb-3 lg:text-3xl">
                {barbershop.name}
              </h1>
              <div className=" mb-2 flex items-center gap-2 lg:mb-0">
                <MapPinIcon className="text-primary" size={18} />
                <p className="text-sm lg:text-base text-zinc-300">
                  {barbershop.address}
                </p>
              </div>
            </div>
            {/* BLOCO DIREITA (AVALIAÇÃO) */}

            <Card className="hidden md:block border-0">
              <div className="hidden md:flex flex-col items-center px-5 py-2.5">
                {totalRatings > 0 ? (
                  <>
                    <div className="flex items-center gap-2">
                      <StarIcon
                        className="text-primary fill-primary"
                        size={20}
                      />
                      <p className="text-sm lg:text-xl font-medium">
                        {averageRating.toFixed(1)}
                      </p>
                    </div>
                    <p className="text-xs mt-2">
                      {totalRatings}{' '}
                      {totalRatings === 1 ? 'avaliação' : 'avaliações'}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 text-center">
                    Esta barbearia ainda não possui avaliações.
                  </p>
                )}
              </div>
            </Card>

            {/* AVALIAÇÃO MOBILE */}
            {totalRatings > 0 ? (
              <div className="flex items-center gap-2 md:hidden">
                <StarIcon className="text-primary fill-primary" size={18} />
                <p className="text-sm">
                  {averageRating.toFixed(1)} ({totalRatings}{' '}
                  {totalRatings === 1 ? 'Avaliação' : 'Avaliações'})
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 md:hidden">
                Esta barbearia ainda não possui avaliações.
              </p>
            )}
          </div>

          {/*DESCRIÇÃO - SOMENTE MOBILE*/}
          <div className="p-5 border-b border-solid space-y-3 md:hidden">
            <h2 className="font-bold uppercase text-gray-400 text-xs">
              Sobre nós
            </h2>
            <p className="text-sn text-justify">{barbershop?.description}</p>
          </div>

          {/* SERVIÇOS*/}
          <div className="p-5 space-y-3  lg:p-0 lg:mt-10">
            <h2 className="font-bold uppercase text-gray-400 text-xs mb-3 lg:text-sm">
              Serviços
            </h2>
            <div className="mt-4">
              {barbershop.services.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Esta barbearia ainda não possui serviços cadastrados.
                </p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4 lg:gap-x-5 lg:gap-y-3">
                  {barbershop.services.map((service) => (
                    <ServiceItem
                      key={service.id}
                      barbershop={JSON.parse(JSON.stringify(barbershop))}
                      service={JSON.parse(JSON.stringify(service))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* COLUNA DIREITA (DESKTOP) */}
        <Card className="hidden md:block lg:w-[350px] border-0 self-start">
          <div className="p-5 space-y-5">
            {/* SOBRE NÓS - SOMENTE DESKTOP */}
            <div>
              <div className="relative h-[180px] w-full mb-5">
                {/* MAPA*/}
                <Image
                  alt="Mapa"
                  src="/map.png"
                  fill
                  className="rounded-xl object-cover"
                />
                {/* CARD SOBRE O MAPA */}
                <Card className="truncate absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-2xl px-2 flex items-center gap-1 h-[35%] md:w-[90%] shadow-lg">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      alt={barbershop.name}
                      src={barbershop?.imageUrl}
                    />
                  </Avatar>
                  <div>
                    <h3 className="text-white font-semibold text-base">
                      {barbershop.name}
                    </h3>
                    <p className="text-zinc-400 text-xs">
                      {barbershop.address}
                    </p>
                  </div>
                </Card>
              </div>

              <h2 className="font-bold uppercase text-sm mb-2.5">Sobre nós</h2>
              <p className="text-sm text-zinc-300 text-justify border-b pb-5">
                {barbershop.description}
              </p>
            </div>
            {/*CONTATO SOMENTE DESKTOP */}
            <div className="hidden md:block space-y-2.5">
              {barbershop.phone.map((phone) => (
                <PhoneItem key={phone} phone={phone} />
              ))}
            </div>
            <div className="flex items-center justify-center">
              <a
                href="https://instagram.com/seuusuario"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="inline-flex"
              >
                <InstagramIcon className="w-8 h-8" />
              </a>
            </div>
            {/*DIAS E HORÁRIOS*/}
            <div className="text-xs  border-t border-zinc-800 pt-3 space-y-1">
              <div className="flex justify-between">
                <p className="text-zinc-500">Segunda</p>
                <p>Fechado</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-500">Terça-Feira</p>
                <p>09:00 - 21:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-500">Quarta-Feira</p>
                <p>09:00 - 21:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-500">Quinta-Feira</p>
                <p>09:00 - 21:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-500">Sexta-Feira</p>
                <p>09:00 - 21:00</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-500">Sábado</p>
                <p>08:00 - 17:00</p>
              </div>
              <div className="flex justify-between">
                <p>Domingo</p>
                <p>Fechado</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm">Em parceria com</p>
              <Image
                alt="CNC Barber"
                src="/logo1.png"
                height={22}
                width={130}
              />
            </div>
          </div>
        </Card>
        {/*CONTATOS SOMENTE MOBILE*/}
        <div className="p-5 space-y-3 md:hidden">
          {barbershop.phone.map((phone) => (
            <PhoneItem key={phone} phone={phone} />
          ))}
          <div className="flex items-center justify-center">
            <a
              href="https://instagram.com/seuusuario"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="inline-flex"
            >
              <InstagramIcon className="w-8 h-8 mt-2" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarbershopPage
