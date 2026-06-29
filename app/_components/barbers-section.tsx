'use client'

import { useState } from 'react'
import { StarIcon } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'

import { Card, CardContent } from '@/app/_components/ui/card'

import BarberInfoSheet from './barber-info-sheet'

interface Barber {
  id: string
  name: string
  imageUrl?: string | null
  email?: string | null
  phone?: string | null
  instagram?: string | null
  speciality?: string | null
  bio?: string | null
  averageRating: number | null
}

interface Props {
  barbers: Barber[]
}

export default function BarbersSection({ barbers }: Props) {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)

  return (
    <>
      <div className="p-5 space-y-3 lg:p-0 lg:mt-10">
        <h2 className="font-bold uppercase text-gray-400 text-xs mb-3 lg:text-sm">
          Equipe
        </h2>

        <div className="mt-4">
          {barbers.length === 0 ? (
            <p className="text-sm text-gray-400">
              Esta barbearia ainda não possui barbeiros cadastrados.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-5">
              {barbers.map((barber) => (
                <Card
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className="
                    border-0
                    cursor-pointer
                    transition-all
                    duration-200
                    hover:scale-[1.02]
                    hover:border-primary
                    hover:bg-accent
                    active:scale-[0.98]
                  "
                >
                  <CardContent className="flex flex-col items-center p-4">
                    <Avatar className="h-14 w-14 lg:h-16 lg:w-16 mb-3">
                      <AvatarImage src={barber.imageUrl || undefined} />

                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                        {barber.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <h3 className="text-sm lg:text-base font-medium text-center line-clamp-2">
                      {barber.name}
                    </h3>

                    <div className="mt-2">
                      {barber.averageRating !== null ? (
                        <div className="flex items-center gap-1">
                          <StarIcon
                            size={14}
                            className="fill-primary text-primary"
                          />

                          <span className="text-sm font-medium">
                            {barber.averageRating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">
                          Sem avaliações
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <BarberInfoSheet
        barber={selectedBarber}
        open={!!selectedBarber}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedBarber(null)
          }
        }}
      />
    </>
  )
}
