"use client"

import { ImageUpload } from "@/app/_components/image-upload"
import { Button } from "@/app/_components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/_components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/app/_components/ui/form"
import { Input } from "@/app/_components/ui/input"
import { Textarea } from "@/app/_components/ui/textarea"
import { zodResolver } from "@hookform/resolvers/zod"
import { Info, Loader2, MapPin, Phone, Plus, Store, X } from "lucide-react"
import { useSession } from "next-auth/react"
import Image from "next/image"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  address: z.string().min(1, "Endereço é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  imageUrl: z.string().min(1, "Imagem é obrigatória"),
  phones: z.array(z.string().regex(phoneRegex, "Formato inválido. Use (00) 00000-0000")),
})

type FormValues = z.infer<typeof formSchema>

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      description: "",
      imageUrl: "",
      phones: [""],
    },
  })

  const watchValues = form.watch()

  useEffect(() => {
    async function loadBarbershop() {
      try {
        const response = await fetch("/api/barbershop/settings")
        if (response.ok) {
          const data = await response.json()
          form.reset({
            name: data.name,
            address: data.address,
            description: data.description,
            imageUrl: data.imageUrl,
            phones: data.phone.length > 0 ? data.phone : [""],
          })
        }
      } catch (error) {
        toast.error("Erro ao carregar dados da barbearia")
      } finally {
        setLoading(false)
      }
    }

    loadBarbershop()
  }, [form])

  async function onSubmit(values: FormValues) {
    try {
      setSaving(true)
      const method = await getInitialMethod()
      const response = await fetch("/api/barbershop/settings", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        toast.success(method === "POST" ? "Barbearia criada com sucesso!" : "Configurações salvas com sucesso!")
      } else {
        toast.error("Erro ao salvar configurações")
      }
    } catch (error) {
      toast.error("Erro ao conectar com o servidor")
    } finally {
      setSaving(false)
    }
  }

  async function getInitialMethod() {
    try {
      const response = await fetch("/api/barbershop/settings")
      if (response.status === 404) return "POST"
      return "PATCH"
    } catch {
      return "POST"
    }
  }

  const addPhone = () => {
    const phones = form.getValues("phones")
    form.setValue("phones", [...phones, ""], { shouldValidate: true })
  }

  const removePhone = (index: number) => {
    const phones = form.getValues("phones")
    if (phones.length > 1) {
      form.setValue("phones", phones.filter((_, i) => i !== index), { shouldValidate: true })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#151619]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-500" />
          <p className="mt-4 text-zinc-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#151619] text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-8 px-5 lg:px-16 pt-8 pb-20">
        
        {/* Header compacto e integrado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3 text-white">
              <Store className="h-6 w-6 text-violet-500" />
              Configurações da Barbearia
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              Gerencie as informações da sua barbearia
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Card - Agora na esquerda */}
          <div className="lg:col-span-1">
            <Card className="border border-[#1f2022] bg-[#1a1b1d] rounded-2xl overflow-hidden sticky top-8">
              <div className="relative h-[280px] w-full">
                {watchValues.imageUrl ? (
                  <Image
                    src={watchValues.imageUrl}
                    alt={watchValues.name || 'Barbearia'}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2b2c2e] to-[#1f2022] flex items-center justify-center">
                    <div className="text-center">
                      <Store className="h-12 w-12 mx-auto text-zinc-600 mb-2" />
                      <p className="text-zinc-500 text-sm">Nenhuma imagem</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <div className="bg-violet-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    PREVIEW
                  </div>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {watchValues.name || 'Nome da Barbearia'}
                  </h3>
                  <p className="text-zinc-400 text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {watchValues.address || 'Endereço não informado'}
                    </span>
                  </p>
                </div>

                {watchValues.phones?.some(p => p) && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {watchValues.phones.filter(Boolean).map((phone, i) => (
                        <span key={i} className="text-xs bg-[#2b2c2e] text-zinc-300 px-2 py-1 rounded-md">
                          {phone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {watchValues.description && (
                  <div className="pt-4 border-t border-[#1f2022]">
                    <p className="text-sm text-zinc-300 line-clamp-4">
                      {watchValues.description}
                    </p>
                  </div>
                )}

                {/* Stats no preview */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#1f2022]">
                  <div className="text-center">
                    <div className="text-white font-bold text-sm">4.8</div>
                    <div className="text-zinc-500 text-xs">Avaliação</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-sm">1.2k</div>
                    <div className="text-zinc-500 text-xs">Clientes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white font-bold text-sm">56</div>
                    <div className="text-zinc-500 text-xs">Agendações</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Section - Agora na direita */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Info className="h-5 w-5 text-violet-500" />
                  Informações da Barbearia
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  Atualize os dados da sua barbearia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Logo Upload */}
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300 font-medium text-sm">
                            Imagem da Barbearia
                          </FormLabel>
                          <FormControl>
                            <ImageUpload
                              value={field.value}
                              onChange={field.onChange}
                              className="h-48 rounded-xl border border-[#2b2c2e]"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nome */}
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm">Nome da Barbearia</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Barbearia Premium"
                                {...field}
                                className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Endereço */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm">Endereço</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Rua Exemplo, 123 - Centro"
                                {...field}
                                className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Descrição */}
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300 font-medium text-sm">Descrição</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Descreva sua barbearia, ambiente, especialidades e diferenciais..."
                              {...field}
                              rows={4}
                              className="bg-[#1f2022] border-[#2b2c2e] text-white resize-none focus:border-violet-500 focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    {/* Telefones */}
                    <FormField
                      control={form.control}
                      name="phones"
                      render={() => (
                        <FormItem>
                          <div className="flex justify-between items-center mb-3">
                            <FormLabel className="text-zinc-300 font-medium text-sm">Telefones de Contato</FormLabel>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addPhone}
                              className="border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white transition-colors"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Adicionar
                            </Button>
                          </div>
                          <div className="space-y-3">
                            {form.watch("phones").map((_, index) => (
                              <div key={index} className="flex gap-2 items-start">
                                <FormField
                                  control={form.control}
                                  name={`phones.${index}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder="(00) 00000-0000"
                                          {...field}
                                          className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                {form.watch("phones").length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePhone(index)}
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end pt-4">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="bg-violet-500 hover:bg-violet-600 text-white min-w-32 transition-colors"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Alterações"
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}