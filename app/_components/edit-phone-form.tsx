'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Pencil, Trash2, X, Check, Phone } from 'lucide-react'

export default function EditPhoneForm({
  userId,
  initialPhone,
}: {
  userId: string
  initialPhone: string
}) {
  const router = useRouter()
  const { update } = useSession()

  const [phone, setPhone] = useState(initialPhone)
  const [editing, setEditing] = useState(false)
  const [inputValue, setInputValue] = useState(initialPhone)
  const [loading, setLoading] = useState(false)

  const hasPhone = phone.trim() !== ''

  function formatPhone(value: string) {
    const numeric = value.replace(/\D/g, '')
    if (numeric.length > 11) return inputValue

    if (numeric.length <= 10) {
      return numeric
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }

    return numeric
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  async function handleSave() {
    if (inputValue.replace(/\D/g, '').length !== 11) {
      return toast.error('Telefone deve ter 11 dígitos.')
    }

    setLoading(true)

    const res = await fetch('/api/user/update-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phone: inputValue }),
    })

    if (!res.ok) {
      setLoading(false)
      return toast.error('Erro ao atualizar telefone.')
    }

    // Atualiza o token JWT para refletir o novo phone sem precisar relogar
    await update()
    router.refresh()

    setPhone(inputValue)
    setEditing(false)
    setLoading(false)
    toast.success('Telefone atualizado com sucesso!')
  }

  async function handleDelete() {
    setLoading(true)

    const res = await fetch('/api/user/update-phone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, phone: '' }),
    })

    if (!res.ok) {
      setLoading(false)
      return toast.error('Erro ao remover telefone.')
    }

    await update()
    router.refresh()

    setPhone('')
    setInputValue('')
    setEditing(false)
    setLoading(false)
    toast.success('Telefone removido.')
  }

  function handleCancel() {
    setInputValue(phone)
    setEditing(false)
  }

  // ── Sem telefone, não editando ──────────────────────────────────────────────
  if (!hasPhone && !editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone</label>
        <p className="text-sm text-muted-foreground">
          Nenhum telefone cadastrado.
        </p>
        <Button
          variant="default"
          className="gap-2 justify-center w-full text-left"
          onClick={() => setEditing(true)}
        >
          <Phone size={14} />
          Adicionar telefone
        </Button>
      </div>
    )
  }

  // ── Com telefone, não editando ──────────────────────────────────────────────
  if (hasPhone && !editing) {
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">Telefone</label>
        <div className="flex items-center gap-2">
          <span className="text-sm border rounded-md px-3 py-2 flex-1 bg-muted/40">
            {phone}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            title="Editar telefone"
            onClick={() => {
              setInputValue(phone)
              setEditing(true)
            }}
          >
            <Pencil size={14} />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="shrink-0"
            title="Remover telefone"
            disabled={loading}
            onClick={handleDelete}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    )
  }

  // ── Editando / adicionando ──────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        {hasPhone ? 'Editar telefone' : 'Adicionar telefone'}
      </label>
      <Input
        value={inputValue}
        maxLength={15}
        autoFocus
        onChange={(e) => setInputValue(formatPhone(e.target.value))}
        placeholder="(00) 00000-0000"
      />
      <div className="flex gap-2">
        <Button
          onClick={handleSave}
          disabled={loading}
          size="sm"
          className="flex-1 gap-2"
        >
          <Check size={14} />
          {loading ? 'Salvando...' : 'Salvar'}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
          className="gap-2"
        >
          <X size={14} />
          Cancelar
        </Button>
      </div>
    </div>
  )
}
