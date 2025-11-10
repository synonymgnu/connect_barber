"use client"

import { useState } from "react"
import { ImagePlus, Trash } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ImageUpload({ value, onChange, className }: ImageUploadProps) {
  const [loading, setLoading] = useState(false)

  // Simula upload de imagem (implemente com seu serviço de upload)
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setLoading(true)
      
      // Integrar com serviço de upload (S3, Cloudinary, etc...)
      // URL temporária
      const imageUrl = URL.createObjectURL(file)
      
      // Simula delay de upload
      setTimeout(() => {
        onChange(imageUrl)
        setLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  const removeImage = () => {
    onChange("")
  }

  return (
    <div className="space-y-4">
      {value ? (
        <div className={`relative w-full ${className || 'h-48'} rounded-lg overflow-hidden border`}>
          <Image
            src={value}
            alt="Upload"
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={removeImage}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Clique para fazer upload
          </p>
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={loading}
        className="hidden"
        id="image-upload"
      />
      
      <label htmlFor="image-upload">
        <Button 
          type="button" 
          variant="outline" 
          disabled={loading}
          className="cursor-pointer"
        >
          {loading ? "Enviando..." : "Escolher Imagem"}
        </Button>
      </label>
    </div>
  )
}