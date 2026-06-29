'use client'

import { useEffect, useState } from 'react'
import {
  Mail,
  Phone,
  Instagram,
  Scissors,
  FileText,
  StarIcon,
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

  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= LG_BREAKPOINT)
    }

    check()

    window.addEventListener('resize', check)

    return () => window.removeEventListener('resize', check)
  }, [])

  if (!barber) return null

  const Content = () => (
    <div className="space-y-6">
      <div className="flex flex-col items-center">
        <Avatar className="h-24 w-24">
          <AvatarImage src={barber.imageUrl || undefined} />
          <AvatarFallback className="text-xl font-bold">
            {barber.name?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Informações do barbeiro</DialogTitle>
          </DialogHeader>

          <Content />
        </DialogContent>
      </Dialog>
    )
  }

  return (
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
  )
}
