'use client'

import { deleteService } from '@/app/_actions/services'
import { ConfirmDialog } from '../confirm-dialog'
import { FeedbackDialog } from '../feedback-dialog'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function DeleteServiceButton({ id, open, setOpen }: any) {
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      await deleteService(id)
      setOpen(false)
      setSuccessDialogIsOpen(true)
      router.refresh()
    } catch (error) {
      setErrorDialogIsOpen(true)
    }
  }

  return (
    <>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        onConfirm={handleDelete}
        title="Deseja excluir este serviço?"
        description="Ao excluir, o serviço será removido permanentemente. Essa ação é irreversível."
      />

      <FeedbackDialog
        open={successDialogIsOpen}
        onOpenChange={setSuccessDialogIsOpen}
        type="success"
        title="Serviço excluído!"
        description="O serviço foi removido com sucesso."
      />

      <FeedbackDialog
        open={errorDialogIsOpen}
        onOpenChange={setErrorDialogIsOpen}
        type="error"
        title="Erro ao excluir serviço!"
        description="Ocorreu um erro ao tentar excluir. Tente novamente."
      />
    </>
  )
}
