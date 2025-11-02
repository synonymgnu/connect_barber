import { signIn } from 'next-auth/react'
import { Button } from './ui/button'
import { DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'

interface SignInDialogProps {
  callbackUrl?: string
}

const SignInDialog = ({ callbackUrl }: SignInDialogProps) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handLeLoginWithGoogleClick = async () => {
    const currentUrl = `${pathname}?${searchParams.toString()}`
    await signIn('google', {
      callbackUrl: callbackUrl ?? currentUrl,
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
        variant="outline"
        className="gap-1 font-bold"
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
    </>
  )
}

export default SignInDialog
