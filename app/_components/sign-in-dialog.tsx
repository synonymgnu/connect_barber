import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface SignInDialogProps {
  callbackUrl?: string
}

const SignInDialog = ({ callbackUrl }: SignInDialogProps) => {
  const pathname = usePathname()

  const handLeLoginWithGoogleClick = async () => {
    await signIn('google', {
      callbackUrl: callbackUrl ?? pathname,
    })
  }

  return (
    <>
      <DialogHeader className="md:items-center">
        <DialogTitle>Faça login ou cadastre-se na plataforma</DialogTitle>
        <DialogDescription>
          Conecte-se usando sua conta do Google.
        </DialogDescription>
      </DialogHeader>
      <Button
        variant="outline"
        className="gap-1 font-bold hover:bg-primary"
        onClick={handLeLoginWithGoogleClick}
      >
        <Image
          alt="Fazer login com o Google"
          src="/google.svg"
          width={18}
          height={18}
        />
        Google
      </Button>
      <p className="text-sm text-center text-gray-400">
        Ao continuar, você aceita nossos{' '}
        <Link
          href="/consent/terms-of-use"
          className="text-[#8161FF] hover:underline"
        >
          Termos de Uso
        </Link>{' '}
        e confirma que leu nossa{' '}
        <Link
          href="/consent/political-privacy"
          className="text-[#8161FF] hover:underline"
        >
          Política de Privacidade.
        </Link>
      </p>
    </>
  )
}

export default SignInDialog
