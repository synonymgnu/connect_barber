'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import z from 'zod'
import { ImageUpload } from '@/app/_components/image-upload'
import { Button } from '@/app/_components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/app/_components/ui/form'
import { Input } from '@/app/_components/ui/input'
import { Textarea } from '@/app/_components/ui/textarea'
import { Checkbox } from '@/app/_components/ui/checkbox'
import {
  AlertCircle,
  Info,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Store,
  X,
  Instagram,
  Facebook,
  MapPinIcon,
  CreditCard,
  Banknote,
  QrCode,
  WalletCards,
} from 'lucide-react'
import Image from 'next/image'

const phoneRegex = /^\(\d{2}\) \d{5}-\d{4}$/
const urlRegex = /^(https?:\/\/.+|)$/

const serviceSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  price: z.string().min(1, 'Preço é obrigatório'),
  duration: z.string().min(1, 'Duração é obrigatória'),
  imageUrl: z.string().min(1, 'Imagem é obrigatória'),
})

const formSchema = z.object({
  // Dados da barbearia
  shopName: z.string().min(1, 'Nome é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  latitude: z.number(),
  longitude: z.number(),
  shopImageUrl: z.string().min(1, 'Imagem é obrigatória'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  phones: z.array(
    z.string().regex(phoneRegex, 'Formato inválido. Use (00) 00000-0000')
  ),
  // Redes Sociais
  socialMedia: z.object({
    instagram: z.string().url('URL inválida').or(z.literal('')),
    facebook: z.string().url('URL inválida').or(z.literal('')),
    googleMaps: z.string(),
  }),
  // Formas de Pagamento
  paymentMethods: z
    .array(z.enum(['cash', 'pix', 'credit_card', 'debit_card']))
    .min(1, 'Selecione pelo menos uma forma de pagamento'),
  // Dados do dono
  ownerName: z.string().min(1, 'Nome do dono é obrigatório'),
  ownerEmail: z.string().email('Email inválido'),
})

type FormValues = z.infer<typeof formSchema>

const paymentMethodsOptions = [
  { id: 'cash', label: 'Dinheiro', icon: Banknote },
  { id: 'pix', label: 'Pix', icon: QrCode },
  { id: 'credit_card', label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'debit_card', label: 'Cartão de Débito', icon: WalletCards },
] as const

export default function NewBarbershopForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [services, setServices] = useState<z.infer<typeof serviceSchema>[]>([])
  const [serviceErrors, setServiceErrors] = useState<string[]>([])

  // ✅ Inicializar form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shopName: '',
      address: '',
      latitude: 0,
      longitude: 0,
      shopImageUrl: '',
      description: '',
      phones: [''],
      socialMedia: {
        instagram: '',
        facebook: '',
        googleMaps: '',
      },
      paymentMethods: [],
      ownerName: '',
      ownerEmail: '',
    },
  })

  const watchValues = form.watch()
  const { shopName, address, latitude, longitude, shopImageUrl, description, phones } = watchValues

  const addPhone = useCallback(() => {
    const currentPhones = form.getValues('phones')
    form.setValue('phones', [...currentPhones, ''], { shouldValidate: true })
  }, [form])

  const removePhone = useCallback(
    (index: number) => {
      const currentPhones = form.getValues('phones')
      if (currentPhones.length > 1) {
        form.setValue(
          'phones',
          currentPhones.filter((_, i) => i !== index),
          { shouldValidate: true }
        )
      }
    },
    [form]
  )
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '').slice(0, 11)

    if (numbers.length <= 2) {
      return numbers
    }

    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
    }

    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  }

  const addService = useCallback(() => {
    setServices((prev) => [
      ...prev,
      { name: '', description: '', price: '', duration: '', imageUrl: '' },
    ])
    setServiceErrors((prev) => [...prev, ''])
  }, [])

  const removeService = useCallback((index: number) => {
    setServices((prev) => prev.filter((_, i) => i !== index))
    setServiceErrors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateService = useCallback(
    (
      index: number,
      field: keyof z.infer<typeof serviceSchema>,
      value: string
    ) => {
      setServices((prev) =>
        prev.map((service, i) =>
          i === index ? { ...service, [field]: value } : service
        )
      )
      if (serviceErrors[index]) {
        setServiceErrors((prev) =>
          prev.map((err, i) => (i === index ? '' : err))
        )
      }
    },
    [serviceErrors]
  )

  const previewImage = useMemo(() => {
    if (!shopImageUrl) {
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2b2c2e] to-[#1f2022] flex items-center justify-center">
          <div className="text-center">
            <Store className="h-12 w-12 mx-auto text-zinc-600 mb-2" />
            <p className="text-zinc-500 text-sm">Nenhuma imagem</p>
          </div>
        </div>
      )
    }
    return (
      <Image
        src={shopImageUrl}
        alt={shopName || 'Barbearia'}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, 33vw"
        quality={85}
      />
    )
  }, [shopImageUrl, shopName])

  async function onSubmit(values: FormValues) {
    setServerError(null)

    // Validar services se houver
    if (services.length > 0) {
      const validationErrors: string[] = []
      for (let i = 0; i < services.length; i++) {
        const service = services[i]
        const validation = serviceSchema.safeParse(service)
        if (!validation.success) {
          validationErrors[i] = validation.error.issues
            .map((issue) => issue.message)
            .join(', ')
        }
      }

      if (validationErrors.some((err) => err)) {
        setServiceErrors(validationErrors)
        setServerError('Verifique os erros nos serviços')
        return
      }
    }

    setIsSubmitting(true)

    try {
      let googleMaps = values.socialMedia.googleMaps.trim()

      // Usuário colou o iframe inteiro
      if (googleMaps.includes('<iframe')) {
        const match = googleMaps.match(/src="([^"]+)"/)

        if (match) {
          googleMaps = match[1]
        }
      }

      // Usuário colou somente a URL mas junto com width=""...
      else if (googleMaps.includes('width=')) {
        googleMaps = googleMaps.split('" width=')[0]
      }
      const res = await fetch('/api/master/barbershops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: values.shopName,
          address: values.address,
          latitude: values.latitude,
          longitude: values.longitude,
          shopImageUrl: values.shopImageUrl,
          description: values.description,
          phone: values.phones.filter(Boolean),
          socialMedia: {
            instagram: values.socialMedia.instagram || null,
            facebook: values.socialMedia.facebook || null,
            googleMaps: googleMaps || null,
          },
          paymentMethods: values.paymentMethods,
          ownerName: values.ownerName,
          ownerEmail: values.ownerEmail,
          services:
            services.length > 0
              ? services.map((s) => ({
                  name: s.name,
                  description: s.description,
                  price: Number(s.price),
                  duration: Number(s.duration),
                  imageUrl: s.imageUrl,
                }))
              : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setServerError(data.error || 'Erro ao criar barbearia')
        setIsSubmitting(false)
        return
      }

      router.push('/master/barbershops')
      router.refresh()
    } catch (err) {
      console.error('Erro ao criar barbearia:', err)
      setServerError('Erro ao criar barbearia')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#151619] text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-8 px-5 lg:px-16 pt-8 pb-20">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
            <Store className="h-8 w-8 text-violet-500" />
            Nova Barbearia
          </h1>
          <p className="text-zinc-400 mt-2">
            Crie uma nova barbearia e defina o proprietário
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Card */}
          <div className="lg:col-span-1">
            <Card className="border border-[#1f2022] bg-[#1a1b1d] rounded-2xl overflow-hidden sticky top-8">
              <div className="relative h-[280px] w-full">{previewImage}</div>

              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                    {shopName || 'Nome da Barbearia'}
                  </h3>
                  <p className="text-zinc-400 text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">
                      {address || 'Endereço não informado'}
                    </span>
                  </p>
                </div>

                {phones?.some((p) => p) && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <div className="flex flex-wrap gap-2">
                      {phones.filter(Boolean).map((phone, i) => (
                        <span
                          key={i}
                          className="text-xs bg-[#2b2c2e] text-zinc-300 px-2 py-1 rounded-md"
                        >
                          {phone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {description && (
                  <div className="pt-4 border-t border-[#1f2022]">
                    <p className="text-sm text-zinc-300 line-clamp-4">
                      {description}
                    </p>
                  </div>
                )}

                {form.watch('paymentMethods').length > 0 && (
                  <div className="pt-4 border-t border-[#1f2022]">
                    <p className="text-xs text-zinc-500 mb-2">
                      Formas de Pagamento
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {form.watch('paymentMethods').map((method) => {
                        const option = paymentMethodsOptions.find(
                          (o) => o.id === method
                        )
                        return (
                          <span
                            key={method}
                            className="text-xs bg-[#2b2c2e] text-zinc-300 px-2 py-1 rounded-md"
                          >
                            {option?.label}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {services.length > 0 && (
                  <div className="pt-4 border-t border-[#1f2022]">
                    <p className="text-xs text-zinc-500 mb-2">Serviços</p>
                    <div className="space-y-1">
                      {services.map((service, i) => (
                        <div key={i} className="text-xs text-zinc-300">
                          {service.name && (
                            <>
                              {service.name} • R${' '}
                              {Number(service.price).toFixed(2)}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Dados da Barbearia */}
                <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Info className="h-5 w-5 text-violet-500" />
                      Informações da Barbearia
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Dados principais da barbearia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Imagem */}
                    <FormField
                      control={form.control}
                      name="shopImageUrl"
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
                        name="shopName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm">
                              Nome da Barbearia
                            </FormLabel>
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
                            <FormLabel className="text-zinc-300 font-medium text-sm">
                              Endereço
                            </FormLabel>
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

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="latitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Latitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                placeholder="-23.561684"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="longitude"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Longitude</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="any"
                                placeholder="-46.655981"
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber)}
                              />
                            </FormControl>
                            <FormMessage />
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
                          <FormLabel className="text-zinc-300 font-medium text-sm">
                            Descrição
                          </FormLabel>
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
                            <FormLabel className="text-zinc-300 font-medium text-sm">
                              Telefones de Contato
                            </FormLabel>
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
                            {form.watch('phones').map((_, index) => (
                              <div
                                key={index}
                                className="flex gap-2 items-start"
                              >
                                <FormField
                                  control={form.control}
                                  name={`phones.${index}`}
                                  render={({ field }) => (
                                    <FormItem className="flex-1">
                                      <FormControl>
                                        <Input
                                          placeholder="(00) 00000-0000"
                                          value={field.value}
                                          onChange={(e) =>
                                            field.onChange(
                                              formatPhone(e.target.value)
                                            )
                                          }
                                          className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                        />
                                      </FormControl>
                                      <FormMessage className="text-red-400 text-xs" />
                                    </FormItem>
                                  )}
                                />
                                {form.watch('phones').length > 1 && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePhone(index)}
                                    className="text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors mt-8"
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
                  </CardContent>
                </Card>

                {/* Redes Sociais e Formas de Pagamento */}
                <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Instagram className="h-5 w-5 text-violet-500" />
                      Redes Sociais e Pagamento
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Links de redes sociais e formas de pagamento aceitas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Redes Sociais */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-zinc-300">
                        Redes Sociais
                      </h4>

                      {/* Instagram */}
                      <FormField
                        control={form.control}
                        name="socialMedia.instagram"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                              <Instagram className="h-4 w-4 text-violet-500" />
                              Instagram
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://instagram.com/seu_perfil"
                                {...field}
                                className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Facebook */}
                      <FormField
                        control={form.control}
                        name="socialMedia.facebook"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                              <Facebook className="h-4 w-4 text-violet-500" />
                              Facebook
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://facebook.com/seu_perfil"
                                {...field}
                                className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      {/* Google Maps */}
                      <FormField
                        control={form.control}
                        name="socialMedia.googleMaps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-zinc-300 font-medium text-sm flex items-center gap-2">
                              <MapPinIcon className="h-4 w-4 text-violet-500" />
                              Google Maps
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder={`Cole aqui o link ou o código <iframe> do Google Maps`}
                                rows={4}
                                {...field}
                                className="bg-[#1f2022] border-[#2b2c2e] text-white resize-none focus:border-violet-500 focus:ring-0"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Formas de Pagamento */}
                    <div className="space-y-4 pt-4 border-t border-[#1f2022]">
                      <h4 className="text-sm font-medium text-zinc-300">
                        Formas de Pagamento
                      </h4>
                      <FormField
                        control={form.control}
                        name="paymentMethods"
                        render={() => (
                          <FormItem>
                            <div className="space-y-3">
                              {paymentMethodsOptions.map((option) => (
                                <FormField
                                  key={option.id}
                                  control={form.control}
                                  name="paymentMethods"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={option.id}
                                        className="flex flex-row items-center space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(
                                              option.id
                                            )}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([
                                                    ...field.value,
                                                    option.id,
                                                  ])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) =>
                                                        value !== option.id
                                                    )
                                                  )
                                            }}
                                            className="border-[#2b2c2e] rounded"
                                          />
                                        </FormControl>
                                        <FormLabel className="font-normal text-zinc-300 cursor-pointer flex items-center gap-2">
                                          <option.icon className="h-4 w-4 text-violet-500" />
                                          {option.label}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Dados do Dono */}
                <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-white">
                      <Store className="h-5 w-5 text-violet-500" />
                      Proprietário
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                      Dados de quem será o dono da barbearia. O login é feito
                      via Google.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ownerName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300 font-medium text-sm">
                            Nome Completo
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="João Silva"
                              {...field}
                              className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ownerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-zinc-300 font-medium text-sm">
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="joao@email.com"
                              {...field}
                              className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Serviços */}
                <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2 text-white">
                          <Plus className="h-5 w-5 text-violet-500" />
                          Serviços
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                          Adicione os serviços oferecidos (opcional)
                        </CardDescription>
                      </div>
                      <Button
                        type="button"
                        onClick={addService}
                        variant="outline"
                        size="sm"
                        className="border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white transition-colors"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Serviço
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {services.length === 0 ? (
                      <p className="text-sm text-zinc-500 italic">
                        Nenhum serviço adicionado
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {services.map((service, index) => (
                          <div
                            key={index}
                            className="border border-[#2b2c2e] rounded-lg p-4 space-y-3"
                          >
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                                      Nome
                                    </label>
                                    <Input
                                      placeholder="Corte de Cabelo"
                                      value={service.name}
                                      onChange={(e) =>
                                        updateService(
                                          index,
                                          'name',
                                          e.target.value
                                        )
                                      }
                                      className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                                      Descrição
                                    </label>
                                    <Input
                                      placeholder="Corte com modelagem"
                                      value={service.description}
                                      onChange={(e) =>
                                        updateService(
                                          index,
                                          'description',
                                          e.target.value
                                        )
                                      }
                                      className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                    />
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                                      Preço (R$)
                                    </label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="60.00"
                                      value={service.price}
                                      onChange={(e) =>
                                        updateService(
                                          index,
                                          'price',
                                          e.target.value
                                        )
                                      }
                                      className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                                      Duração (min)
                                    </label>
                                    <Input
                                      type="number"
                                      placeholder="30"
                                      value={service.duration}
                                      onChange={(e) =>
                                        updateService(
                                          index,
                                          'duration',
                                          e.target.value
                                        )
                                      }
                                      className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-xs font-medium text-zinc-400 mb-1 block">
                                      Imagem
                                    </label>
                                    <Input
                                      placeholder="https://utfs.io/f/..."
                                      value={service.imageUrl}
                                      onChange={(e) =>
                                        updateService(
                                          index,
                                          'imageUrl',
                                          e.target.value
                                        )
                                      }
                                      className="bg-[#1f2022] border-[#2b2c2e] text-white focus:border-violet-500 focus:ring-0"
                                    />
                                  </div>
                                </div>
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeService(index)}
                                variant="ghost"
                                size="icon"
                                className="text-zinc-500 hover:text-red-400 hover:bg-red-900/20 transition-colors flex-shrink-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            {serviceErrors[index] && (
                              <div className="text-xs text-red-400 bg-red-900/20 rounded px-2 py-1">
                                {serviceErrors[index]}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Erros */}
                {serverError && (
                  <div className="flex gap-3 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{serverError}</p>
                  </div>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white min-h-11 transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    'Criar Barbearia'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  )
}
