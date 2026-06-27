'use client'

import { useState } from 'react'
import { Button } from '@/app/_components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/app/_components/ui/sheet'
import { MapPinIcon } from 'lucide-react'
import Image from 'next/image'

interface MapButtonSheetProps {
  googleMapsUrl: string
}

export default function MapButtonSheet({ googleMapsUrl }: MapButtonSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="link" size="sm" className="mb-2 text-xs md:hidden">
          Ver Mapa
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] max-h-[40vh] p-0">
        <div className="h-full w-full p-5">
          <h2 className="font-bold uppercase text-sm mb-4">Localização</h2>
          <div className="relative h-[calc(100%-50px)] w-full rounded-xl overflow-hidden">
            {googleMapsUrl ? (
              <iframe
                src={googleMapsUrl}
                className="w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <Image alt="Mapa" src="/map.png" fill className="object-cover" />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
