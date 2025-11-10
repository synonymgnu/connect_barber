'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { ServiceForm } from './service-form'
import { createService } from '@/app/_actions/services'
import { Button } from '../ui/button'
import { useState } from 'react'
import { FeedbackDialog } from '../feedback-dialog'
import { useRouter } from 'next/navigation'

export function CreateServiceDialog() {
  const [open, setOpen] = useState(false)
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const router = useRouter()

  const handleSubmit = async (data: any) => {
    try {
      await createService(data)
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
        <DialogTrigger asChild>
          <Button onClick={() => setOpen(true)}>Cadastrar novo</Button>
        </DialogTrigger>

        <DialogContent className="w-[90%] rounded-lg">
          <DialogHeader>
            <DialogTitle>Cadastrar Serviço</DialogTitle>
          </DialogHeader>

          <ServiceForm onSubmit={handleSubmit} />
        </DialogContent>
      </Dialog>

      {/* Sucesso */}
      <FeedbackDialog
        open={successDialogIsOpen}
        onOpenChange={setSuccessDialogIsOpen}
        type="success"
        title="Serviço criado com sucesso!"
        description="O novo serviço foi adicionado à lista."
      />

      {/* Erro */}
      <FeedbackDialog
        open={errorDialogIsOpen}
        onOpenChange={setErrorDialogIsOpen}
        type="error"
        title="Erro ao criar serviço!"
        description="Ocorreu um erro ao tentar criar o serviço. Tente novamente."
      />
    </>
  )
}
