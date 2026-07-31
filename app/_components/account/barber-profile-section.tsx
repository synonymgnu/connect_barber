'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Input } from '@/app/_components/ui/input'
import { Label } from '@/app/_components/ui/label'
import { Textarea } from '@/app/_components/ui/textarea'
import { Button } from '@/app/_components/ui/button'
import { Badge } from '@/app/_components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/_components/ui/avatar'
import { Separator } from '@/app/_components/ui/separator'
import { Save, Scissors, Instagram, Phone, Loader2, CheckCircle, XCircle } from 'lucide-react'

interface BarberProfile {
  id: string
  name: string
  email: string
  phone: string | null
  imageUrl: string | null
  bio: string | null
  instagram: string | null
  speciality: string | null
  isActive: boolean
}

export default function BarberProfileSection() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<BarberProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    instagram: '',
    speciality: '',
  })

  useEffect(() => {
    fetch('/api/barber/profile')
      .then((r) => r.json())
      .then((data) => {
        setProfile(data)
        setForm({
          name: data.name || '',
          phone: data.phone || '',
          bio: data.bio || '',
          instagram: data.instagram || '',
          speciality: data.speciality || '',
        })
      })
      .catch(() => toast.error('Erro ao carregar perfil'))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/barber/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setProfile(updated)
      toast.success('Perfil atualizado com sucesso!')
    } else {
      toast.error('Erro ao salvar perfil')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!profile) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Scissors className="h-5 w-5 text-[#8161FF]" />
          Perfil de Barbeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status + avatar */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={session?.user?.image || profile.imageUrl || ''} />
            <AvatarFallback className="text-lg">{form.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-base">{profile.name}</p>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <Badge
              variant="outline"
              className={`mt-1 text-xs ${profile.isActive ? 'border-green-500 text-green-600' : 'border-red-500 text-red-500'}`}
            >
              {profile.isActive ? (
                <><CheckCircle className="h-3 w-3 mr-1" /> Ativo</>
              ) : (
                <><XCircle className="h-3 w-3 mr-1" /> Inativo</>
              )}
            </Badge>
          </div>
        </div>

        <Separator />

        {/* Form */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="barber-name">Nome profissional</Label>
            <Input
              id="barber-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-phone">
              <Phone className="h-3.5 w-3.5 inline mr-1" />
              Telefone
            </Label>
            <Input
              id="barber-phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-speciality">
              <Scissors className="h-3.5 w-3.5 inline mr-1" />
              Especialidade
            </Label>
            <Input
              id="barber-speciality"
              value={form.speciality}
              onChange={(e) => setForm({ ...form, speciality: e.target.value })}
              placeholder="Ex.: Fade, Barba, Sobrancelha"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-instagram">
              <Instagram className="h-3.5 w-3.5 inline mr-1" />
              Instagram
            </Label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 bg-muted text-muted-foreground text-sm">
                @
              </span>
              <Input
                id="barber-instagram"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                placeholder="usuario"
                className="rounded-l-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="barber-bio">Bio</Label>
          <Textarea
            id="barber-bio"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Fale sobre você, sua experiência e estilo de trabalho..."
            rows={3}
          />
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Salvando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" /> Salvar Perfil</>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
