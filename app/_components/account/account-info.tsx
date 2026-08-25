'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Separator } from '../ui/separator'
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog'
import {
  User as UserIcon,
  Pencil,
  Save,
  Loader2,
  CalendarClock,
  LayoutDashboard,
  Crown,
  Scissors,
  MapPin,
  CheckCircle,
  XCircle,
  LogOutIcon,
  Trash2,
} from 'lucide-react'
import { AccountInfoProps } from '../../../types/account'
import EditPhoneForm from '../edit-phone-form'
import SignOutDialog from '../sign-out-dialog'
import DeleteAccountDialog from '../delete-account-dialog'

export default function AccountInfo({
  user,
  bookings,
  barberStatus,
  barbershop,
}: AccountInfoProps) {
  const router = useRouter()
  const [editingName, setEditingName] = useState(false)
  const [name, setName] = useState(user.name ?? '')
  const [saving, setSaving] = useState(false)

  const roleConfig = {
    CLIENT: { label: 'Cliente', icon: UserIcon },
    BARBER: { label: 'Barbeiro', icon: Scissors },
    ADMIN: { label: 'Administrador', icon: LayoutDashboard },
    MASTER: { label: 'Master', icon: Crown },
  } as const

  const RoleIcon = roleConfig[user.role].icon

  const handleSaveName = async () => {
    if (!name.trim() || name === user.name) {
      setEditingName(false)
      setName(user.name ?? '')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (!res.ok) throw new Error()

      const updated = await res.json()
      setName(updated.name ?? name.trim())
      toast.success('Nome atualizado com sucesso!')
      setEditingName(false)
      router.refresh()
    } catch {
      toast.error('Erro ao atualizar nome')
      setName(user.name ?? '')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto self-start">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <RoleIcon className="h-5 w-5 text-[#8161FF]" />
          Minha Conta
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Configure suas informações pessoais ou exclua sua conta.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ===== AVATAR + NOME + ROLE ===== */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image ?? ''} referrerPolicy="no-referrer" />
            <AvatarFallback className="text-lg">
              {(name || '?')[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-8"
                  autoFocus
                  disabled={saving}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 shrink-0"
                  onClick={handleSaveName}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-base truncate">{name}</p>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-muted-foreground hover:text-foreground shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>

            <Badge variant="outline" className="mt-1.5 text-xs">
              {roleConfig[user.role].label}
              {user.role === 'BARBER' && (
                <>
                  {' '}
                  •{' '}
                  {barberStatus === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 text-green-600 ml-1">
                      <CheckCircle className="h-3 w-3" /> Ativo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-500 ml-1">
                      <XCircle className="h-3 w-3" /> Inativo
                    </span>
                  )}
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* ===== TELEFONE ===== */}
        <Separator />
        <div>
          <EditPhoneForm
            userId={user.id}
            initialPhone={(user.phone ?? '').trim()}
          />
        </div>

        {/* ===== BARBEARIA (barbeiro ou dono) ===== */}
        {barbershop && (
          <>
            <Separator />
            <Link
              href={`/barbershops/${barbershop.id}`}
              className="flex gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-14 w-14 rounded-md">
                <AvatarImage
                  src={barbershop.images?.[0] ?? ''}
                  className="object-cover"
                />
                <AvatarFallback className="rounded-md">
                  <Scissors className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {user.role === 'ADMIN'
                    ? 'Barbearia que você é proprietário'
                    : 'Barbearia onde você trabalha'}
                </p>
                <p className="font-semibold truncate">{barbershop.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {barbershop.address}
                </p>
              </div>
            </Link>
          </>
        )}

        {/* ===== RESERVAS (cliente) ===== */}
        {user.role === 'CLIENT' && (
          <>
            <Separator />
            <div className="space-y-3">
              <h2 className="font-semibold text-sm">Últimas reservas</h2>

              {bookings?.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma reserva encontrada.
                </p>
              )}

              {bookings?.slice(0, 3).map((b) => (
                <div key={b.id} className="border p-3 rounded-md">
                  <p className="font-semibold text-sm">{b.service.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(b.date), "dd/MM/yyyy 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ===== AÇÕES POR ROLE ===== */}
        {(user.role === 'BARBER' ||
          user.role === 'ADMIN' ||
          user.role === 'MASTER') && (
          <>
            <Separator />
            <div className="flex flex-col sm:flex-row gap-2">
              {user.role === 'BARBER' && (
                <Button asChild variant="default" className="gap-2">
                  <Link href="/barber/schedule">
                    <CalendarClock className="h-4 w-4" />
                    Editar agenda
                  </Link>
                </Button>
              )}

              {user.role === 'ADMIN' && (
                <Button asChild className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Painel administrativo
                  </Link>
                </Button>
              )}

              {user.role === 'MASTER' && (
                <Button asChild className="gap-2">
                  <Link href="/master">
                    <Crown className="h-4 w-4" />
                    Painel Master
                  </Link>
                </Button>
              )}
            </div>
          </>
        )}

        {/* ===== SAIR / EXCLUIR CONTA ===== */}
        <Separator />
        <div className="flex flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild className="w-full sm:w-auto">
              <Button variant="secondary" className="gap-2 justify-center">
                <LogOutIcon size={18} />
                Sair da Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
              <SignOutDialog />
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild className="w-full sm:w-auto">
              <Button variant="destructive" className="gap-2 justify-center">
                <Trash2 size={18} />
                Excluir conta
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] lg:w-[35%] max-w-[500px] rounded-lg">
              <DeleteAccountDialog userId={user.id} role={user.role} />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
