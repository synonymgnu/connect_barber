"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/_components/ui/dialog"
import { Textarea } from "../ui/textarea"

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
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
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      speciality: "",
      bio: "",
      instagram: "",
    },
  })

  useEffect(() => {
    if (barber) {
      form.reset({
        name: barber.name || "",
        email: barber.email || "",
        phone: barber.phone || "",
        speciality: barber.speciality || "",
        bio: barber.bio || "",
        instagram: barber.instagram || "",
      })
    } else {
      form.reset({
        name: "",
        email: "",
        phone: "",
        speciality: "",
        bio: "",
        instagram: "",
      })
    }
  }, [barber, open, form])

  const handleSubmit = async (data: FormData) => {
    await onSubmit(data)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{barber ? "Editar Barbeiro" : "Novo Barbeiro"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <Label>Nome Completo *</Label>
            <Input placeholder="Nome completo" {...form.register("name")} />
            {form.formState.errors.name && <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Email *</Label>
              <Input type="email" placeholder="email@exemplo.com" {...form.register("email")} />
              {form.formState.errors.email && <p className="text-red-600 text-sm mt-1">{form.formState.errors.email.message}</p>}
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
            <Textarea placeholder="Fale um pouco sobre você..." rows={3} {...form.register("bio")} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}