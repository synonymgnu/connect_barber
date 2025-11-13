"use client"

import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Save } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  bio: z.string().optional(),
  instagram: z.string().optional(),
  speciality: z.string().optional(),
})

export default function ProfileCard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: session?.user?.name || "",
      bio: "",
      instagram: "",
      speciality: "",
    },
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    await fetch("/api/barber/profile", { method: "PATCH", body: JSON.stringify(data) })
    toast.success("Perfil atualizado!")
    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>{session?.user?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label>Nome</Label>
            <Input {...form.register("name")} />
          </div>
        </div>

        <div>
          <Label>Bio</Label>
          <Textarea {...form.register("bio")} placeholder="Fale sobre você..." />
        </div>

        <div>
          <Label>Especialidade</Label>
          <Input {...form.register("speciality")} placeholder="Ex.: Fade, Barba, Sobrancelha" />
        </div>

        <div>
          <Label>Instagram</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted">@</span>
            <Input {...form.register("instagram")} placeholder="usuario" className="rounded-l-none" />
          </div>
        </div>

        <Button onClick={form.handleSubmit(onSubmit)} disabled={loading}>
          {loading ? "Salvando..." : <><Save className="h-4 w-4 mr-2" /> Salvar</>}
        </Button>
      </CardContent>
    </Card>
  )
}