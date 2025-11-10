"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"

import { Button }         from "@/app/_components/ui/button"
import { Input }          from "@/app/_components/ui/input"
import { Label }          from "@/app/_components/ui/label"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from "@/app/_components/ui/dialog"
import { Camera } from "lucide-react"
import { Textarea } from "../ui/textarea"

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  imageUrl: z.string().optional(),
  speciality: z.string().optional(),
  bio: z.string().optional(),
  instagram: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  barber?: any
  onSubmit: (data: FormData) => Promise<void>
}

export function BarberModal({ open, onOpenChange, barber, onSubmit }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: barber || {},
  })

  useEffect(() => {
    if (barber) form.reset(barber)
    else form.reset({})
  }, [barber, form])

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data)
  }

  const previewUrl = form.watch("imageUrl")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{barber ? "Editar Barbeiro" : "Novo Barbeiro"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={previewUrl || `https://ui-avatars.com/api/?name=${form.watch("name")}&background=bc130d&color=fff`}
                alt="avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full object-cover border"
              />
              <Label className="absolute -bottom-2 -right-2 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer">
                <Camera className="w-4 h-4" />
                <Input type="file" className="sr-only" accept="image/*" onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = () => form.setValue("imageUrl", reader.result as string)
                    reader.readAsDataURL(file)
                  }
                }} />
              </Label>
            </div>
            <div className="flex-1">
              <Label>Nome</Label>
              <Input placeholder="Nome completo" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-red-600 text-sm">{form.formState.errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="email@exemplo.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-red-600 text-sm">{form.formState.errors.email.message}</p>}
            </div>
            <div>
              <Label>Telefone</Label>
              <Input placeholder="(00) 00000-0000" {...form.register("phone")} />
            </div>
          </div>

          <div>
            <Label>Especialidade</Label>
            <Input placeholder="Ex.: Fade, Barba, Sobrancelha" {...form.register("speciality")} />
          </div>

          <div>
            <Label>Instagram</Label>
            <Input placeholder="@usuario" {...form.register("instagram")} />
          </div>

          <div>
            <Label>Bio</Label>
            <Textarea placeholder="Fale um pouco sobre você..." {...form.register("bio")} />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}