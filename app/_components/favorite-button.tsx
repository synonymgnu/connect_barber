'use client'

import { useState, useTransition } from 'react'
import { HeartIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from './ui/button'
import { toggleFavoriteBarbershop } from '@/app/_actions/toggle-favorite-barbershop'
import { toggleFavoriteBarber } from '@/app/_actions/toggle-favorite-barber'

interface FavoriteButtonProps {
  type: 'barbershop' | 'barber'
  id: string
  isFavorited: boolean
  className?: string
}

export default function FavoriteButton({
  type,
  id,
  isFavorited,
  className,
}: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(isFavorited)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const previous = favorited
    setFavorited(!previous) // optimistic

    startTransition(async () => {
      try {
        const result =
          type === 'barbershop'
            ? await toggleFavoriteBarbershop(id)
            : await toggleFavoriteBarber(id)

        setFavorited(result.favorited)
        router.refresh()
      } catch (error) {
        setFavorited(previous) // reverte em caso de erro (ex: não logado)
        console.error(error)
      }
    })
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={handleClick}
      disabled={isPending}
      aria-label={
        favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'
      }
      className={className}
    >
      <HeartIcon
        size={20}
        className={favorited ? 'fill-primary text-primary' : 'text-white'}
      />
    </Button>
  )
}
