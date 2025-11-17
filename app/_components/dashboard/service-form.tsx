'use client'

import { useState } from 'react'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { ImageUploadField } from './image-upload-field'
import { Trash } from 'lucide-react'

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
    'https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',
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
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price.replace(',', '.')),
          imageUrl: formData.imageUrl,
          duration: Number(formData.duration), // <-- AGORA VAI
        })
      }}
      className="gap-5  flex flex-col"
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

        <div className="grid grid-cols-3 gap-4 mt-3 items-center justify-items-center w-full">
          {/* Imagem da ESQUERDA */}
          <button
            type="button"
            onClick={() => {
              handleImageChange(referenceImages[0])
              setTouched({ ...touched, imageUrl: true })
            }}
            className={`w-14 h-14 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition ${
              formData.imageUrl === referenceImages[0]
                ? 'border-primary ring-2 ring-primary/40'
                : 'border-muted hover:border-primary/40'
            }`}
          >
            <img
              src={referenceImages[0]}
              alt="Imagem de referência"
              className="object-cover w-full h-full"
            />
          </button>

          {/* Upload no CENTRO */}
          {formData.imageUrl ? (
            <div className="relative w-full h-full rounded-lg overflow-hidden border">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="object-cover w-full h-full"
              />

              <Button
                variant="destructive"
                type="button"
                size="default"
                onClick={() => handleImageChange('')}
                className="absolute top-2 right-2  text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
              >
                <Trash />
              </Button>
            </div>
          ) : (
            <ImageUploadField
              value={formData.imageUrl}
              onChange={handleImageChange}
            />
          )}

          {/* Imagem da DIREITA */}
          <button
            type="button"
            onClick={() => {
              handleImageChange(referenceImages[1])
              setTouched({ ...touched, imageUrl: true })
            }}
            className={`w-14 h-14 lg:w-20 lg:h-20 rounded-lg overflow-hidden border-2 transition ${
              formData.imageUrl === referenceImages[1]
                ? 'border-primary ring-2 ring-primary/40'
                : 'border-muted hover:border-primary/40'
            }`}
          >
            <img
              src={referenceImages[1]}
              alt="Imagem de referência"
              className="object-cover w-full h-full"
            />
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full mt-auto" disabled={isDisabled}>
        Salvar
      </Button>
    </form>
  )
}
