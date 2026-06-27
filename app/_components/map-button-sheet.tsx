'use client'

import { useState } from 'react'
import { Button } from '@/app/_components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/app/_components/ui/sheet'
import { MapPinIcon } from 'lucide-react'
import Image from 'next/image'

interface MapButtonSheetProps {
  googleMapsUrl: string
  address: string
}

export default function MapButtonSheet({
  googleMapsUrl,
  address,
}: MapButtonSheetProps) {
  const [isOpen, setIsOpen] = useState(false)

  const uberUrl = `https://www.uber.com/launch?dropoff_address=${encodeURIComponent(address)}`

  const UberIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
    </svg>
  )

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="link" size="sm" className="mb-2 text-xs md:hidden">
          Ver Mapa
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[50vh] max-h-[40vh] p-0">
        <div className="h-full w-full flex flex-col p-5">
          <h2 className="font-bold uppercase text-sm mb-4">Localização</h2>
          <div className="relative flex-1 w-full rounded-xl overflow-hidden mb-4">
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

          {/* BOTÃO UBER */}
          <a
            href={uberUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full"
          >
            <Button className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-900 text-white">
              <UberIcon className="w-5 h-5" />
              Ir para Uber
            </Button>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  )
}
