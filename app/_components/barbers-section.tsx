'use client'

import { useState, useRef, useCallback } from 'react'
import { StarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'

import { Card, CardContent } from '@/app/_components/ui/card'

import BarberInfoSheet from './barber-info-sheet'
import { Button } from './ui/button'
import FavoriteButton from './favorite-button'

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
  isFavorited?: boolean
}

interface Props {
  barbers: Barber[]
}

function useDragScroll() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const isPointerDown = useRef(false)
  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const scrollStartX = useRef(0)
  const pointerId = useRef<number | null>(null)
  const draggedRef = useRef(false)

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!scrollRef.current) return
    isPointerDown.current = true
    draggedRef.current = false
    dragStartX.current = e.clientX
    scrollStartX.current = scrollRef.current.scrollLeft
    pointerId.current = e.pointerId
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown.current || !scrollRef.current) return
    const delta = e.clientX - dragStartX.current

    if (!isDragging.current && Math.abs(delta) > 6) {
      isDragging.current = true
      draggedRef.current = true
      if (pointerId.current !== null) {
        scrollRef.current.setPointerCapture(pointerId.current)
      }
    }

    if (isDragging.current) {
      scrollRef.current.scrollLeft = scrollStartX.current - delta
    }
  }

  const handlePointerUp = () => {
    isPointerDown.current = false
    isDragging.current = false
  }

  const scrollByAmount = useCallback((amount: number) => {
    scrollRef.current?.scrollBy({ left: amount, behavior: 'smooth' })
  }, [])

  return {
    scrollRef,
    draggedRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    scrollByAmount,
  }
}

export default function BarbersSection({ barbers }: Props) {
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null)
  const desktopDrag = useDragScroll()
  const mobileDrag = useDragScroll()

  const handleCardClick = (
    barber: Barber,
    draggedRef: React.RefObject<boolean>
  ) => {
    if (draggedRef.current) return
    setSelectedBarber(barber)
  }

  const BarberCard = ({
    barber,
    draggedRef,
  }: {
    barber: Barber
    draggedRef: React.RefObject<boolean>
  }) => (
    <Card
      onClick={() => handleCardClick(barber, draggedRef)}
      className="
        relative
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
      <FavoriteButton
        type="barber"
        id={barber.id}
        isFavorited={!!barber.isFavorited}
        className="absolute right-2 top-2 h-7 w-7 z-10"
      />

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
              <StarIcon size={14} className="fill-primary text-primary" />

              <span className="text-sm font-medium">
                {barber.averageRating.toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Sem avaliações</span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const CarouselArrows = ({
    onPrev,
    onNext,
  }: {
    onPrev: () => void
    onNext: () => void
  }) => (
    <>
      <Button
        type="button"
        onClick={onPrev}
        aria-label="Anterior"
        className="absolute -left-2 lg:-left-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        onClick={onNext}
        aria-label="Próximo"
        className="absolute -right-2 lg:-right-4 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </>
  )

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
          ) : barbers.length === 1 ? (
            <div className="flex justify-center">
              <div className="w-40 lg:w-48">
                <BarberCard
                  barber={barbers[0]}
                  draggedRef={{ current: false }}
                />
              </div>
            </div>
          ) : barbers.length === 2 ? (
            <div className="grid grid-cols-2 gap-4 lg:gap-5 max-w-md mx-auto">
              {barbers.map((barber) => (
                <BarberCard
                  key={barber.id}
                  barber={barber}
                  draggedRef={{ current: false }}
                />
              ))}
            </div>
          ) : barbers.length === 3 ? (
            <>
              <div className="hidden lg:grid lg:grid-cols-3 lg:gap-5  mx-auto">
                {barbers.map((barber) => (
                  <BarberCard
                    key={barber.id}
                    barber={barber}
                    draggedRef={{ current: false }}
                  />
                ))}
              </div>

              <div className="relative lg:hidden">
                <div
                  ref={mobileDrag.scrollRef}
                  onPointerDown={mobileDrag.handlePointerDown}
                  onPointerMove={mobileDrag.handlePointerMove}
                  onPointerUp={mobileDrag.handlePointerUp}
                  onPointerLeave={mobileDrag.handlePointerUp}
                  style={{ touchAction: 'pan-y' }}
                  className="flex gap-4 overflow-x-auto scroll-smooth select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                >
                  {barbers.map((barber) => (
                    <div key={barber.id} className="w-[calc(50%-8px)] shrink-0">
                      <BarberCard
                        barber={barber}
                        draggedRef={mobileDrag.draggedRef}
                      />
                    </div>
                  ))}
                </div>
                <CarouselArrows
                  onPrev={() => mobileDrag.scrollByAmount(-160)}
                  onNext={() => mobileDrag.scrollByAmount(160)}
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <div
                ref={desktopDrag.scrollRef}
                onPointerDown={desktopDrag.handlePointerDown}
                onPointerMove={desktopDrag.handlePointerMove}
                onPointerUp={desktopDrag.handlePointerUp}
                onPointerLeave={desktopDrag.handlePointerUp}
                style={{ touchAction: 'pan-y' }}
                className="flex gap-4 lg:gap-5 overflow-x-auto scroll-smooth select-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {barbers.map((barber) => (
                  <div
                    key={barber.id}
                    className="w-[calc(50%-8px)] lg:w-[calc(33.333%-14px)] shrink-0"
                  >
                    <BarberCard
                      barber={barber}
                      draggedRef={desktopDrag.draggedRef}
                    />
                  </div>
                ))}
              </div>
              <CarouselArrows
                onPrev={() => desktopDrag.scrollByAmount(-200)}
                onNext={() => desktopDrag.scrollByAmount(200)}
              />
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
