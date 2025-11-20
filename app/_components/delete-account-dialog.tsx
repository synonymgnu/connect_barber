'use client'

import { Button } from './ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { DialogClose } from './ui/dialog'
import { signOut } from 'next-auth/react'

export default function DeleteAccountDialog({
  userId,
  role,
}: {
  userId: string
  role: string
}) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch('/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ userId, role }),
    })

    if (!res.ok) {
      return toast.error('Erro ao excluir conta.')
    }

    toast.success('Conta excluída com sucesso!')

    // 👇 FINALIZA A SESSÃO DO NEXTAUTH
    await signOut({ redirect: false })

    router.push('/')
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Excluir sua Conta</h2>

      <p className="text-sm text-muted-foreground">
        Ao continuar, você confirma que entende seus direitos garantidos pela
        <strong> Lei Geral de Proteção de Dados (Lei nº 13.709/2018)</strong>:
        seus dados pessoais serão removidos de forma permanente, não sendo
        possível recuperar sua conta posteriormente.
      </p>

      <p className="text-sm text-muted-foreground">Esta ação é irreversível.</p>

      <div className="flex gap-2">
        <DialogClose asChild>
          <Button variant="secondary" className="w-full">
            Voltar
          </Button>
        </DialogClose>

        <Button variant="destructive" className="w-full" onClick={handleDelete}>
          Confirmar Exclusão
        </Button>
      </div>
    </div>
  )
}
