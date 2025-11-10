'use client'

import Image from 'next/image'
import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'success' | 'error'
  title: string
  description: string
}

export function FeedbackDialog({
  open,
  onOpenChange,
  type,
  title,
  description,
}: FeedbackDialogProps) {
  const icon = type === 'success' ? '/Vector.png' : '/Error.png'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
        <DialogHeader className="items-center">
          <Image alt={type} src={icon} height={60} width={60} />
          <DialogTitle className={`text-lg font-bold`}>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{description}</DialogDescription>

        <DialogFooter className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
