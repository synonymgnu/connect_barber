'use client'

import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ImageUploadField } from './image-upload-field'

export function ServiceForm({ onSubmit, initialData }: any) {
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      duration: '',
    }
  )

  const [touched, setTouched] = useState({
    name: false,
    price: false,
    duration: false,
    imageUrl: false,
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name === 'duration') {
      const numeric = value.replace(/\D/g, '') // Só números
      if (Number(numeric) > 999) return // Ex: máximo 999 min = 16,667h
      setFormData({ ...formData, duration: numeric })
      return
    }

    if (name === 'price') {
      // Permite apenas dígitos, vírgula e ponto (substitui múltiplos separadores)
      let formatted = value.replace(/[^\d.,]/g, '').replace(',', '.')
      // Evita múltiplos pontos
      const parts = formatted.split('.')
      if (parts.length > 2) formatted = parts[0] + '.' + parts.slice(1).join('')

      const numeric = parseFloat(formatted)

      if (numeric < 0) return

      const MAX_PRICE = 9999
      if (numeric > MAX_PRICE) return
      setFormData({ ...formData, price: formatted })
      return
    }

    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (url: string) => {
    setFormData({ ...formData, imageUrl: url })
  }

  const referenceImages = [
    'https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png', // Barba
    'https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png', // Pézinho / Hidratação
    'https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png', // Massagem
  ]

  const isDisabled =
    !formData.name.trim() ||
    !formData.price ||
    Number(formData.price) <= 0 ||
    !formData.imageUrl ||
    !formData.duration ||
    Number(formData.duration) <= 0

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({
          ...formData,
          // Converte vírgula para ponto ao enviar para o banco
          price: parseFloat(formData.price.replace(',', '.')),
          duration: Number(formData.duration),
        })
      }}
      className="space-y-4"
    >
      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ex: Corte Social"
          onBlur={() => setTouched({ ...touched, name: true })}
        />
        {touched.name && !formData.name.trim() && (
          <p className="text-xs text-red-500 mt-1">O nome é obrigatório.</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="(opcional)"
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground text-right mt-1">
          {formData.description.length}/50
        </p>
      </div>

      <div>
        <Label htmlFor="price">Preço</Label>
        <Input
          id="price"
          name="price"
          type="text"
          inputMode="decimal"
          value={formData.price}
          onChange={handleChange}
          placeholder="Ex: 50"
          onBlur={() => setTouched({ ...touched, price: true })}
        />
        {touched.price && (!formData.price || Number(formData.price) <= 0) && (
          <p className="text-xs text-red-500 mt-1">O preço é obrigatório.</p>
        )}
      </div>

      <div>
        <Label htmlFor="duration">Duração (minutos)</Label>
        <Input
          id="duration"
          name="duration"
          type="text"
          inputMode="numeric"
          value={formData.duration}
          onChange={handleChange}
          placeholder="Ex: 45"
          onBlur={() => setTouched({ ...touched, duration: true })}
        />
        {touched.duration &&
          (!formData.duration || Number(formData.duration) <= 0) && (
            <p className="text-xs text-red-500 mt-1">
              A duração é obrigatória.
            </p>
          )}
      </div>

      <div>
        <Label>Imagem do serviço</Label>

        {/* Galeria de imagens de referência */}
        <div className="grid grid-cols-3 gap-2 mt-2">
          {referenceImages.map((img) => (
            <button
              key={img}
              type="button"
              onClick={() => {
                handleImageChange(img)
                setTouched({ ...touched, imageUrl: true })
              }}
              className={`rounded-lg overflow-hidden border-2 transition ${
                formData.imageUrl === img
                  ? 'border-primary ring-2 ring-primary/40'
                  : 'border-muted hover:border-primary/40'
              }`}
            >
              <img
                src={img}
                alt="Imagem de referência"
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
        {touched.imageUrl && !formData.imageUrl && (
          <p className="text-xs text-red-500 mt-1">A imagem é obrigatória.</p>
        )}

        <p className="text-xs text-muted-foreground text-center my-2">
          ou envie uma nova imagem
        </p>

        <ImageUploadField
          value={formData.imageUrl}
          onChange={handleImageChange}
        />
      </div>

      <Button type="submit" className="w-full mt-4" disabled={isDisabled}>
        Salvar
      </Button>
    </form>
  )
}
