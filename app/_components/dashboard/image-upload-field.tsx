'use client'

import { useState } from 'react'
import Image from 'next/image'
import { UploadButton } from '@/utils/uploadthing'
import { Button } from '../ui/button'
import { CirclePlus } from 'lucide-react'

export function ImageUploadField({
  value,
  onChange,
}: {
  value?: string
  onChange: (url: string) => void
}) {
  const [preview, setPreview] = useState<string | undefined>(value)

  return (
    <div className="flex flex-col items-center gap-3 relative">
      {preview && (
        <div className="relative w-40 h-40">
          <Image
            src={preview}
            alt="Preview da imagem"
            fill
            className="rounded-lg object-cover border"
          />
        </div>
      )}

      {/* Botão visual personalizado */}
      <div className="relative">
        <Button type="button">
          <CirclePlus />
          {preview ? 'Trocar imagem' : 'Fazer upload'}
        </Button>

        {/* UploadButton real posicionado sobre o botão, mas invisível */}
        <div className="absolute inset-0 opacity-0 cursor-pointer">
          <UploadButton
            endpoint="serviceImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0].url
              setPreview(url)
              onChange(url)
            }}
            onUploadError={(error: Error) => alert(`Erro: ${error.message}`)}
            content={{
              button() {
                return null // escondemos o botão interno
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
