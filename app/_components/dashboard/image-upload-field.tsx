'use client'

import { useState, useEffect } from 'react'
import { UploadButton } from '@/utils/uploadthing'
import { ImagePlus } from 'lucide-react'
import Image from 'next/image'

export function ImageUploadField({
  value,
  onChange,
}: {
  value?: string
  onChange: (url: string) => void
}) {
  const [preview, setPreview] = useState<string | undefined>(value)

  useEffect(() => {
    setPreview(value)
  }, [value])

  return (
    <div className="flex flex-col items-center gap-2 relative">
      {/* Área do preview SEMPRE existente */}
      <div className="w-28 h-28 lg:w-32 lg:h-32 rounded-lg border border-dashed border-zinc-600 flex flex-col items-center justify-center gap-2">
        {/* Botão personalizado */}
        <div className="relative items-center text-center justify-center">
          {/* Se houver imagem, exibir preview */}
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover rounded-lg"
            />
          ) : (
            <ImagePlus size={40} className="text-gray-400" />
          )}

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

        <span className="text-xs text-gray-400 text-center p-1">
          Fazer upload (até 4MB)
        </span>
      </div>
    </div>
  )
}
