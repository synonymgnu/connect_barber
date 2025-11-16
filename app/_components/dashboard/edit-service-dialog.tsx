'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { ServiceForm } from './service-form'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FeedbackDialog } from '../feedback-dialog'

const updateService = async (id: string, data: any) => {
  const { updateService } = await import('@/app/_actions/update-service')
  return updateService(id, data)
}

export function EditServiceDialog({ service, open, setOpen }: any) {
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const router = useRouter()

  const handleEdit = async (data: any) => {
    try {
      await updateService(service.id, data)
      setOpen(false)
      setSuccessDialogIsOpen(true)
      router.refresh()
    } catch (error) {
      setErrorDialogIsOpen(true)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Editar Serviço</DialogTitle>
          </DialogHeader>

          <ServiceForm initialData={service} onSubmit={handleEdit} />
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        open={successDialogIsOpen}
        onOpenChange={setSuccessDialogIsOpen}
        type="success"
        title="Serviço atualizado com sucesso!"
        description="As alterações foram salvas corretamente."
      />

      <FeedbackDialog
        open={errorDialogIsOpen}
        onOpenChange={setErrorDialogIsOpen}
        type="error"
        title="Erro ao atualizar serviço!"
        description="Ocorreu um erro ao tentar atualizar. Tente novamente."
      />
    </>
  )
}
