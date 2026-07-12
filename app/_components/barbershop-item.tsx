import { Card, CardContent } from './ui/card'
import Image from 'next/image'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { StarIcon } from 'lucide-react'
import Link from 'next/link'

interface BarbershopItemProps {
  barbershop: {
    id: string
    name: string
    address: string
    images: string[]
    averageRating: number
  }
  containerWidth?: 'carousel' | 'search' | 'detail'
}

const BarbershopItem = ({
  barbershop,
  containerWidth = 'search',
}: BarbershopItemProps) => {
  // carousel: w-[167px] (home padronizado)
  // search: w-full mobile, min-w-[200px] desktop (grid responsivo)
  // detail: min-w-[250px] (barbershop detail bem alargado)
  const widthClass =
    containerWidth === 'carousel'
      ? 'w-[167px] shrink-0'
      : containerWidth === 'search'
        ? 'w-full md:w-auto md:min-w-[200px]'
        : 'min-w-[250px]'

  return (
    <Card className={`${widthClass} rounded-2xl`}>
      <CardContent className="p-0 px-1 pt-1">
        {/* IMAGEM */}
        <div className="relative h-[159px] w-full">
          <Image
            alt={barbershop.name}
            fill
            className="rounded-2xl object-cover"
            src={barbershop.images[0]}
          />
          {barbershop.averageRating > 0 && (
            <Badge
              className="absolute left-2 top-2 space-x-1"
              variant="secondary"
            >
              <StarIcon size={12} className="fill-primary text-primary" />
              <p className="text-xs font-semibold">
                {barbershop.averageRating.toFixed(1)}
              </p>
            </Badge>
          )}
        </div>

        {/* TEXTO */}
        <div className="px-1 py-3">
          <h3 className="truncate font-semibold">{barbershop.name}</h3>
          <p className="truncate text-sm text-gray-400">{barbershop.address}</p>
          <Button variant="secondary" className="mt-3 w-full" asChild>
            <Link href={`/barbershops/${barbershop.id}`}>Reservar</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default BarbershopItem
