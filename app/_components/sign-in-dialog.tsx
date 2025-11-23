import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { useState } from 'react'

interface SignInDialogProps {
  callbackUrl?: string
}

const SignInDialog = ({ callbackUrl }: SignInDialogProps) => {
  const pathname = usePathname()

  const [isAccepted, setIsAccepted] = useState(false)

  const handLeLoginWithGoogleClick = async () => {
    await signIn('google', {
      callbackUrl: callbackUrl ?? pathname,
    })
  }

  return (
    <>
      <DialogHeader className="md:items-center">
        <DialogTitle>Faça login na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>
      <Button
        variant="default"
        className="gap-1 font-bold"
        onClick={handLeLoginWithGoogleClick}
        disabled={!isAccepted}
      >
        <Image
          alt="Fazer login com o Google"
          src="/google.svg"
          width={18}
          height={18}
        />
        Google
      </Button>
      <div className="text-center text-xs text-gray-500 mt-0">
        Para acessar os serviços do Connect Barber, você precisa concordar com
        os nossos
        <Button variant="link" className="text-xs px-1">
          <Link href="/consent">Termos de Serviço</Link>
        </Button>
        <div className="flex items-center gap-3 mt-5">
          <Checkbox
            id="terms"
            checked={isAccepted}
            onCheckedChange={(checked) => setIsAccepted(!!checked)}
          />
          <Label htmlFor="terms" className="text-xs">
            Li e aceito os termos e condições
          </Label>
        </div>
      </div>
    </>
  )
}

export default SignInDialog
