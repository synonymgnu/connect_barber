'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from './ui/dialog'
import { Button } from './ui/button'
import { createRating } from '../_actions/create-rating'
import { StarIcon } from 'lucide-react'
import Image from 'next/image'

interface RatingDialogProps {
  bookingId: string
}

export default function RatingDialog({ bookingId }: RatingDialogProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [open, setOpen] = useState(false)
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      await createRating(bookingId, rating, comment)
      setOpen(false)
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      setErrorDialogIsOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (successDialogIsOpen) {
      const timer = setTimeout(() => {
        setSuccessDialogIsOpen(false)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [successDialogIsOpen])

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full">Avaliar</Button>
        </DialogTrigger>
        <DialogContent className="w-[90%] rounded-lg items-center">
          <DialogHeader>
            <DialogTitle>Avalie sua experiência</DialogTitle>
            <DialogDescription>
              Toque nas estrelas para avaliar sua esperiência na Barberaria
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 mt-3 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                key={star}
                onClick={() => setRating(star)}
                className={`text-2xl ${star <= rating ? 'text-primary ' : 'text-gray-400'}`}
                variant="ghost"
              >
                <StarIcon className="" />
              </Button>
            ))}
          </div>

          <textarea
            className="w-full mt-3 rounded-md border bg-transparent p-2 text-sm"
            placeholder="Deixe um comentário (opcional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">
                Fechar
              </Button>
            </DialogClose>
            <Button className="w-full" onClick={handleSubmit}>
              {isSubmitting ? 'Enviando...' : 'Enviar avaliação'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de sucesso */}
      <Dialog open={successDialogIsOpen} onOpenChange={setSuccessDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
          <DialogHeader className="items-center">
            <Image alt="Check" src="/Vector.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold">
              Avaliação enviada com sucesso!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Obrigado por compartilhar sua experiência conosco
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => setSuccessDialogIsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de erro */}
      <Dialog open={errorDialogIsOpen} onOpenChange={setErrorDialogIsOpen}>
        <DialogContent className="w-[90%] lg:w-[30%] text-center rounded-lg">
          <DialogHeader className="items-center">
            <Image alt="Erro" src="/Error.png" height={60} width={60} />
            <DialogTitle className="text-lg font-bold text-red-600">
              Erro ao enviar avaliação!
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Ocorreu um erro ao tentar enviar sua avaliação. Tente novamente em
            alguns instantes.
          </DialogDescription>

          <DialogFooter className="flex flex-col gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setErrorDialogIsOpen(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
