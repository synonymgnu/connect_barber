'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { UploadButton } from '@/utils/uploadthing'
import { Button } from '../ui/button'
import { CirclePlus } from 'lucide-react'

export function ImageUploadField({
  value,
  onChange,
  isSelected,
}: {
  value?: string
  onChange: (url: string) => void
  isSelected?: boolean
}) {
  const [preview, setPreview] = useState<string | undefined>(value)

  useEffect(() => {
    setPreview(value)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Área do preview SEMPRE existente */}
      <div
        className={`
          relative w-20 h-20 lg:w-32 lg:h-32 rounded-lg overflow-hidden border-2
          transition 
          ${isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-muted'}
        `}
      >
        {preview ? (
          <Image src={preview} alt="Preview" fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col gap-2 items-center justify-center text-xs text-muted-foreground text-center">
            Faça upload de uma imagem
          </div>
        )}
      </div>

      {/* Botão personalizado */}
      <div className="relative">
        <Button type="button" size="sm">
          <CirclePlus />
          {preview ? 'Trocar imagem' : 'Fazer upload'}
        </Button>

        {/* Upload real invisível */}
        <div className="absolute inset-0 opacity-0 cursor-pointer">
          <UploadButton
            endpoint="serviceImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0].url
              setPreview(url)
              onChange(url)
            }}
            onUploadError={(err) => alert(err.message)}
            content={{
              button() {
                return null
              },
              allowedContent() {
                return ''
              },
            }}
          />
        </div>
      </div>

      <span className="text-xs text-gray-400">Imagens até 4MB</span>
    </div>
  )
}
