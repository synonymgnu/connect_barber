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
  barbershopName: string
}

export default function RatingDialog({
  bookingId,
  barbershopName,
}: RatingDialogProps) {
  const [rating, setRating] = useState(0)

  const [open, setOpen] = useState(false)
  const [successDialogIsOpen, setSuccessDialogIsOpen] = useState(false)
  const [errorDialogIsOpen, setErrorDialogIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit() {
    try {
      setIsSubmitting(true)
      await createRating(bookingId, rating, '')
      setOpen(false)
      setSuccessDialogIsOpen(true)
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
      setErrorDialogIsOpen(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setRating(0)
    }
  }

  const handleStarClick = (star: number) => {
    if (star === rating) {
      setRating(0)
    } else {
      setRating(star)
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
      <Dialog open={open} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button className="w-full">Avaliar</Button>
        </DialogTrigger>
        <DialogContent className="w-[90%] lg:w-[30%] rounded-lg items-center">
          <DialogHeader className="items-center">
            <DialogTitle>Avalie sua experiência</DialogTitle>
            <DialogDescription className="text-center">
              Toque nas estrelas para avaliar sua esperiência na {''}
              <span className="font-semibold text-primary">
                {barbershopName}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2 my-5 justify-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Button
                size="icon"
                key={star}
                onClick={() => handleStarClick(star)}
                className="transition-transform hover:scale-110"
                variant="ghost"
              >
                <StarIcon
                  className={`${
                    star <= rating
                      ? 'fill-primary text-primary'
                      : 'fill-transparent text-gray-400'
                  } transition-all duration-200`}
                />
              </Button>
            ))}
          </div>

          <DialogFooter className="flex flex-row gap-3">
            <DialogClose asChild>
              <Button variant="secondary" className="w-full">
                Fechar
              </Button>
            </DialogClose>
            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={rating === 0}
            >
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
