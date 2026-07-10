'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from './ui/button'

interface BarbershopImageCarouselProps {
  images: string[]
  alt: string
  className?: string
  autoPlayInterval?: number
}

export default function BarbershopImageCarousel({
  images,
  alt,
  className = '',
  autoPlayInterval = 4000,
}: BarbershopImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartX = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasMultiple = images.length > 1

  const goTo = useCallback(
    (index: number) => {
      const total = images.length
      const next = ((index % total) + total) % total
      setCurrentIndex(next)
    },
    [images.length]
  )

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo])
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo])

  useEffect(() => {
    if (!hasMultiple || isDragging) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, autoPlayInterval)
    return () => clearInterval(timer)
  }, [hasMultiple, isDragging, images.length, autoPlayInterval])

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!hasMultiple) return
    setIsDragging(true)
    dragStartX.current = e.clientX
    containerRef.current?.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    setDragOffset(e.clientX - dragStartX.current)
  }

  const endDrag = () => {
    if (!isDragging) return
    setIsDragging(false)
    const threshold = 50
    if (dragOffset > threshold) {
      goPrev()
    } else if (dragOffset < -threshold) {
      goNext()
    }
    setDragOffset(0)
  }

  // Impede que o clique nos controles (setas/dots) dispare a lógica de arraste do container
  const stopDragPropagation = (e: React.PointerEvent) => {
    e.stopPropagation()
  }

  if (images.length === 0) {
    return (
      <div
        className={`relative bg-zinc-800 flex items-center justify-center ${className}`}
      >
        <p className="text-zinc-500 text-sm">Sem imagens</p>
      </div>
    )
  }

  return (
    <div
      className={`relative overflow-hidden select-none ${className}`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div
        className="flex h-full"
        style={{
          transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
          transition: isDragging ? 'none' : 'transform 500ms ease-out',
        }}
      >
        {images.map((src, index) => (
          <div key={index} className="relative h-full w-full flex-shrink-0">
            <Image
              alt={`${alt} - foto ${index + 1}`}
              src={src}
              fill
              className="object-cover md:rounded-lg pointer-events-none"
              priority={index === 0}
            />
          </div>
        ))}
      </div>

      {hasMultiple && (
        <>
          <Button
            type="button"
            onPointerDown={stopDragPropagation}
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="Imagem anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            onPointerDown={stopDragPropagation}
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="Próxima imagem"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>

          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                type="button"
                onPointerDown={stopDragPropagation}
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(index)
                }}
                aria-label={`Ir para imagem ${index + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
