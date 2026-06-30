'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Mail,
  Phone,
  Instagram,
  Scissors,
  FileText,
  StarIcon,
  X,
  ZoomIn,
} from 'lucide-react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/app/_components/ui/avatar'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/_components/ui/dialog'

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/app/_components/ui/drawer'

interface BarberInfoSheetProps {
  barber: any | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const LG_BREAKPOINT = 1024

export default function BarberInfoSheet({
  barber,
  open,
  onOpenChange,
}: BarberInfoSheetProps) {
  const [isDesktop, setIsDesktop] = useState(false)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= LG_BREAKPOINT)
    }

    check()

    window.addEventListener('resize', check)

    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    if (imageModalOpen) {
      setZoom(1)
    }
  }, [imageModalOpen])

  useEffect(() => {
    if (open) {
      setImageModalOpen(false)
    }
  }, [open])

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom((prev) => Math.max(1, Math.min(prev + delta, 3)))
  }

  const handleImageClick = () => {
    if (barber.imageUrl) {
      setImageModalOpen(true)
    }
  }

  if (!barber) return null

  const Content = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <button
          onClick={handleImageClick}
          className={`relative group ${barber.imageUrl ? 'cursor-pointer' : ''}`}
        >
          <Avatar className="h-24 w-24">
            <AvatarImage src={barber.imageUrl || undefined} />
            <AvatarFallback className="text-xl font-bold">
              {barber.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {barber.imageUrl && (
            <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
              <ZoomIn
                size={20}
                className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </div>
          )}
        </button>

        <h2 className="mt-4 text-2xl font-bold text-center">{barber.name}</h2>

        {barber.averageRating !== null && (
          <div className="mt-2 flex items-center gap-1">
            <StarIcon className="fill-primary text-primary" size={18} />
            <span className="font-medium">
              {barber.averageRating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {barber.phone && (
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-muted-foreground" />

            <span className="text-sm">{barber.phone}</span>
          </div>
        )}

        {barber.instagram && (
          <div className="flex items-center gap-3">
            <Instagram size={18} className="text-muted-foreground" />

            <a
              href={`https://instagram.com/${barber.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:text-primary transition-colors"
            >
              {barber.instagram}
            </a>
          </div>
        )}
      </div>

      {barber.speciality && (
        <div className="border-t pt-5">
          <div className="flex items-center gap-2 mb-2">
            <Scissors size={18} className="text-primary" />

            <h3 className="font-semibold">Especialidade</h3>
          </div>

          <p className="text-sm text-muted-foreground">{barber.speciality}</p>
        </div>
      )}

      {barber.bio && (
        <div className="border-t pt-5">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={18} className="text-primary" />

            <h3 className="font-semibold">Bio</h3>
          </div>

          <p className="text-sm whitespace-pre-line text-muted-foreground">
            {barber.bio}
          </p>
        </div>
      )}
    </div>
  )

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Informações do barbeiro</DialogTitle>
            </DialogHeader>

            <Content />
          </DialogContent>
        </Dialog>

        {imageModalOpen && open && barber.imageUrl && (
          <div
            className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center cursor-zoom-in"
            onClick={() => setImageModalOpen(false)}
            onWheel={handleWheel}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                setImageModalOpen(false)
              }}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
            >
              <X size={24} />
            </button>

            <div className="relative w-[90vw] h-[90vh]">
              <Image
                src={barber.imageUrl}
                alt={barber.name}
                fill
                className="object-contain"
                style={{
                  transform: `scale(${zoom})`,
                  transition: 'transform 0.2s ease-out',
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Informações do barbeiro</DrawerTitle>
          </DrawerHeader>

          <div className="px-4 pb-8">
            <Content />
          </div>
        </DrawerContent>
      </Drawer>

      {imageModalOpen && open && barber.imageUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
          onWheel={handleWheel}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setImageModalOpen(false)
            }}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
          >
            <X size={24} />
          </button>

          <div className="relative w-full h-[60vh]">
            <Image
              src={barber.imageUrl}
              alt={barber.name}
              fill
              className="object-contain"
              style={{
                transform: `scale(${zoom})`,
                transition: 'transform 0.2s ease-out',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}
