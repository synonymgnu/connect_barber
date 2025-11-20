'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function EditPhoneForm({
  userId,
  initialPhone,
}: {
  userId: string
  initialPhone: string
}) {
  const router = useRouter()

  const [phone, setPhone] = useState(initialPhone)
  const [loading, setLoading] = useState(false)

  const hasPhone = initialPhone.trim() !== ''

  // 🔥 Função para aplicar máscara automática
  function formatPhone(value: string) {
    // remove tudo que não for número
    const numeric = value.replace(/\D/g, '')

    // bloqueia mais de 11 dígitos
    if (numeric.length > 11) return phone

    if (numeric.length <= 10) {
      return numeric
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    }

    // formato para celular (11 dígitos)
    return numeric
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
  }

  async function handleSave() {
    if (phone.replace(/\D/g, '').length !== 11) {
      return toast.error('Telefone deve ter 11 dígitos.')
    }

    setLoading(true)

    const res = await fetch('/api/user/update-phone', {
      method: 'POST',
      body: JSON.stringify({ userId, phone }),
    })

    setLoading(false)

    if (!res.ok) return toast.error('Erro ao atualizar telefone')

    toast.success('Telefone atualizado com sucesso!')

    router.refresh() // <-- garante que o valor persista ao dar F5
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Telefone</label>

      <Input
        value={phone}
        maxLength={15}
        onChange={(e) => setPhone(formatPhone(e.target.value))}
        placeholder="(00) 00000-0000"
      />

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {hasPhone ? 'Editar' : 'Salvar'}
      </Button>
    </div>
  )
}
