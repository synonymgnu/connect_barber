import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { StarIcon, MapPinIcon } from 'lucide-react'

import { authOptions } from '@/app/_lib/auth' // ajuste o caminho
import { db } from '@/app/_lib/prisma'
import Header from '@/app/_components/header'
import { Card, CardContent } from '@/app/_components/ui/card'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'
import FavoriteButton from '@/app/_components/favorite-button'

const FavoritesPage = async () => {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/')
  }

  const userId = session.user.id

  const [favoriteBarbershops, favoriteBarbers] = await Promise.all([
    db.favoriteBarbershop.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        barbershop: {
          include: { ratings: true },
        },
      },
    }),
    db.favoriteBarber.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        barber: {
          include: { barbershop: true },
        },
      },
    }),
  ])

  return (
    <div>
      <div className="hidden md:block">
        <Header isHidden="md:flex" />
      </div>

      <div className="p-5 space-y-8 lg:ml-32 lg:mr-32 lg:mt-10">
        <h1 className="text-xl font-bold lg:text-2xl">Favoritos</h1>

        <section className="space-y-3">
          <h2 className="font-bold uppercase text-gray-400 text-xs lg:text-sm">
            Barbearias
          </h2>

          {favoriteBarbershops.length === 0 ? (
            <p className="text-sm text-gray-400">
              Você ainda não favoritou nenhuma barbearia.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteBarbershops.map(({ barbershop }) => {
                const totalRatings = barbershop.ratings.length
                const averageRating =
                  totalRatings > 0
                    ? barbershop.ratings.reduce((acc, r) => acc + r.value, 0) /
                      totalRatings
                    : 0

                return (
                  <Link
                    key={barbershop.id}
                    href={`/barbershops/${barbershop.id}`}
                  >
                    <Card className="border-0 relative overflow-hidden hover:scale-[1.01] transition-transform">
                      <FavoriteButton
                        type="barbershop"
                        id={barbershop.id}
                        isFavorited
                        className="absolute right-2 top-2 z-10 h-8 w-8"
                      />
                      <div className="relative h-32 w-full">
                        <Image
                          src={barbershop.images[0] ?? '/map.png'}
                          alt={barbershop.name}
                          fill
                          className="object-cover rounded-t-lg"
                        />
                      </div>
                      <CardContent className="p-3 space-y-1">
                        <h3 className="font-medium text-sm truncate">
                          {barbershop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-zinc-400">
                          <MapPinIcon size={12} />
                          <span className="truncate">{barbershop.address}</span>
                        </div>
                        {totalRatings > 0 && (
                          <div className="flex items-center gap-1">
                            <StarIcon
                              size={12}
                              className="fill-primary text-primary"
                            />
                            <span className="text-xs">
                              {averageRating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="font-bold uppercase text-gray-400 text-xs lg:text-sm">
            Barbeiros
          </h2>

          {favoriteBarbers.length === 0 ? (
            <p className="text-sm text-gray-400">
              Você ainda não favoritou nenhum barbeiro.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteBarbers.map(({ barber }) => (
                <Link
                  key={barber.id}
                  href={`/barbershops/${barber.barbershopId}`}
                >
                  <Card className="border-0 relative hover:scale-[1.02] transition-transform">
                    <FavoriteButton
                      type="barber"
                      id={barber.id}
                      isFavorited
                      className="absolute right-2 top-2 z-10 h-7 w-7"
                    />
                    <CardContent className="flex flex-col items-center p-4">
                      <Avatar className="h-14 w-14 mb-3">
                        <AvatarImage src={barber.imageUrl || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                          {barber.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-sm font-medium text-center line-clamp-2">
                        {barber.name}
                      </h3>
                      <p className="text-xs text-zinc-400 truncate">
                        {barber.barbershop.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default FavoritesPage
