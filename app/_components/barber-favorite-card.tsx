'use client'

import { BarbershopService } from '@prisma/client'
import { Clock3 } from 'lucide-react'
import Link from 'next/link'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/_components/ui/sheet'
import FavoriteButton from '@/app/_components/favorite-button'
import ServiceItem from '@/app/_components/service-item'

interface BarberFavoriteCardProps {
  barber: {
    id: string
    name: string
    imageUrl?: string | null
    services: BarbershopService[]
  }
  barbershop: {
    id: string
    name: string
  }
}

export default function BarberFavoriteCard({
  barber,
  barbershop,
}: BarberFavoriteCardProps) {
  return (
    <Card className="border-0 relative">
      <FavoriteButton
        type="barber"
        id={barber.id}
        isFavorited
        className="absolute right-2 top-2 z-10 h-7 w-7"
      />

      <CardContent className="flex flex-col items-center p-4">
        <Link
          href={`/barbershops/${barbershop.id}`}
          className="flex flex-col items-center hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-14 w-14 mb-3">
            <AvatarImage src={barber.imageUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
              {barber.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <h3 className="text-sm font-medium text-center line-clamp-2">
            {barber.name}
          </h3>
          <p className="text-xs text-zinc-400 truncate mb-3">
            {barbershop.name}
          </p>
        </Link>

        <Sheet>
          <SheetTrigger asChild>
            <Button size="sm" variant="secondary" className="w-full gap-2">
              <Clock3 className="h-4 w-4" />
              Horários
            </Button>
          </SheetTrigger>

          <SheetContent className="p-0 overflow-y-auto w-full">
            <SheetHeader className="p-5 border-b text-left">
              <SheetTitle>{barber.name}</SheetTitle>
              <p className="text-sm text-zinc-400">{barbershop.name}</p>
            </SheetHeader>

            <div className="p-5 space-y-3">
              {barber.services.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Este barbeiro ainda não possui serviços cadastrados.
                </p>
              ) : (
                barber.services.map((service) => (
                  <ServiceItem
                    key={service.id}
                    barbershop={barbershop}
                    service={service}
                    preSelectedBarberId={barber.id}
                  />
                ))
              )}
            </div>
          </SheetContent>
        </Sheet>
      </CardContent>
    </Card>
  )
}
