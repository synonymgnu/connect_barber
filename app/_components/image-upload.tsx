'use client'

import { useState, useEffect } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { Button } from './ui/button'
import { Input } from './ui/input'

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ImageUpload({
  value,
  onChange,
  className = 'h-48',
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value)
  const [urlInput, setUrlInput] = useState(value)

  useEffect(() => {
    setPreview(value)
    setUrlInput(value)
  }, [value])

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl)
    setPreview(newUrl)
    onChange(newUrl)
  }

  const handleRemove = () => {
    setPreview('')
    setUrlInput('')
    onChange('')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Área de preview */}
      <div
        className={`relative w-full ${className} rounded-xl border border-[#2b2c2e] bg-[#1f2022] flex items-center justify-center overflow-hidden group`}
      >
        {preview ? (
          <>
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              onError={() => setPreview('')}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remover
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3">
            <ImagePlus size={40} className="text-zinc-500" />
            <span className="text-sm text-zinc-400">Nenhuma imagem</span>
          </div>
        )}
      </div>

      {/* Campo de URL */}
      <div>
        <label className="text-xs font-medium text-zinc-400 mb-2 block">
          URL da Imagem
        </label>
        <Input
          type="text"
          placeholder="https://utfs.io/f/..."
          value={urlInput}
          onChange={(e) => handleUrlChange(e.target.value)}
          className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
        />
      </div>

      <p className="text-xs text-zinc-500">
        Cole a URL da imagem do UploadThing (PNG, JPG, GIF até 4MB)
      </p>
    </div>
  )
}
