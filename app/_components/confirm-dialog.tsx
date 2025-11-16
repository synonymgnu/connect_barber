'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/app/_components/ui/dialog'
import { Button } from '@/app/_components/ui/button'
import { ReactNode } from 'react'

interface ConfirmDialogProps {
  triggerLabel?: string
  trigger?: ReactNode
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function ConfirmDialog({
  triggerLabel,
  trigger,
  title,
  description,
  onConfirm,
  open,
  onOpenChange,
}: ConfirmDialogProps) {
  const isControlled = open !== undefined && onOpenChange !== undefined

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Só usa DialogTrigger se NÃO estiver controlado externamente */}
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger ? (
            trigger
          ) : (
            <Button variant="destructive" className="w-full">
              {triggerLabel || 'Confirmar'}
            </Button>
          )}
        </DialogTrigger>
      )}

      <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
        <DialogHeader className="items-center">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-row gap-3">
          <DialogClose asChild>
            <Button variant="secondary" className="w-full">
              Voltar
            </Button>
          </DialogClose>

          <DialogClose asChild>
            <Button
              variant="destructive"
              className="w-full"
              onClick={onConfirm}
            >
              Confirmar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
