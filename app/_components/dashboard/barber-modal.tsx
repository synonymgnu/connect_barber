'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'

import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { Label } from '@/app/_components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/app/_components/ui/dialog'
import { Textarea } from '../ui/textarea'
import { UploadButton } from '@/utils/uploadthing'
import { Checkbox } from '../ui/checkbox'

const schema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  speciality: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  imageUrl: z.string().optional(),
  serviceIds: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

interface Service {
  id: string
  name: string
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  barber?: any
  services: Service[]
  onSubmit: (data: FormData) => Promise<void>
}

export function BarberModal({
  open,
  onOpenChange,
  barber,
  services,
  onSubmit,
}: Props) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  const [selectedServices, setSelectedServices] = useState<string[]>([])

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      speciality: '',
      bio: '',
      instagram: '',
      imageUrl: '',
      serviceIds: [],
    },
  })

  useEffect(() => {
    if (barber) {
      form.reset({
        name: barber.name || '',
        email: barber.email || '',
        phone: barber.phone || '',
        speciality: barber.speciality || '',
        bio: barber.bio || '',
        instagram: barber.instagram || '',
        imageUrl: barber.imageUrl || '',
        serviceIds: barber.services?.map((s: Service) => s.id) || [],
      })
      setImageUrl(barber.imageUrl || undefined)
      setSelectedServices(barber.services?.map((s: Service) => s.id) || [])
    } else {
      form.reset({
        name: '',
        email: '',
        phone: '',
        speciality: '',
        bio: '',
        instagram: '',
        imageUrl: '',
        serviceIds: [],
      })
      setImageUrl(undefined)
      setSelectedServices([])
    }
  }, [barber, open, form])

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      imageUrl: imageUrl || undefined,
      serviceIds: selectedServices,
    })
    form.reset()
    setImageUrl(undefined)
    setSelectedServices([])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh]  max-w-[90vw] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
          <DialogTitle>
            {barber ? 'Editar Barbeiro' : 'Novo Barbeiro'}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col overflow-hidden flex-1"
        >
          <div className="space-y-4 overflow-y-auto px-6 pb-4 flex-1">
            {/* Foto de perfil */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-muted">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt="Foto do barbeiro"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-primary flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {form.watch('name')?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              <UploadButton
                endpoint="barberImage"
                onClientUploadComplete={(res) => {
                  if (res?.[0]?.url) setImageUrl(res[0].url)
                }}
                onUploadError={(err) => console.error(err)}
                appearance={{
                  button:
                    'ut-ready:bg-primary ut-uploading:bg-primary/70 text-xs px-3 py-1 h-8',
                }}
                content={{ button: 'Alterar foto' }}
              />
            </div>

            <div>
              <Label>Nome Completo *</Label>
              <Input placeholder="Nome completo" {...form.register('name')} />
              {form.formState.errors.name && (
                <p className="text-red-600 text-sm mt-1">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-red-600 text-sm mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Telefone</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  {...form.register('phone')}
                />
              </div>
            </div>

            <div>
              <Label>Especialidade</Label>
              <Input
                placeholder="Ex.: Fade, Barba, Sobrancelha"
                {...form.register('speciality')}
              />
            </div>

            <div>
              <Label>Instagram</Label>
              <Input placeholder="@usuario" {...form.register('instagram')} />
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                placeholder="Fale um pouco sobre você..."
                rows={3}
                {...form.register('bio')}
              />
            </div>

            <div>
              <Label className="text-base font-semibold">
                Serviços que executa
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Selecione os serviços executados por este barbeiro.
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {services.map((service) => (
                  <label
                    key={service.id}
                    className="flex items-center gap-3 rounded-lg border px-4 py-3 cursor-pointer hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <span>{service.name}</span>
                  </label>
                ))}
                {services.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Nenhum serviço cadastrado ainda.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 border-t shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
