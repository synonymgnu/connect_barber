'use client'

import { Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/app/_components/ui/button'

interface ShareBarbershopButtonProps {
  name: string
  description?: string
  className?: string
}

export default function ShareBarbershopButton({
  name,
  description,
  className,
}: ShareBarbershopButtonProps) {
  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description ? `${name} - ${description}` : name,
          url,
        })
      } catch {
        // Usuário cancelou o compartilhamento — não faz nada
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado para a área de transferência!')
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <Button
      size="icon"
      variant="outline"
      onClick={handleShare}
      aria-label="Compartilhar barbearia"
      className={className}
    >
      <Share2 className="h-4 w-4" />
    </Button>
  )
}
