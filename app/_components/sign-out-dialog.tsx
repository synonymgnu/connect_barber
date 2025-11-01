'use client'

import { signOut } from 'next-auth/react'

import { usePathname, useRouter } from 'next/navigation'
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { Button } from './ui/button'

const SignOutDialog = () => {
  const router = useRouter()
  const pathname = usePathname()

  const handLelogoutCLick = async () => {
    await signOut({ redirect: false })

    if (pathname === '/bookings') {
      router.push('/')
    }
  }

  return (
    <>
      <DialogHeader className="items-center">
        <DialogTitle>Sair</DialogTitle>
        <DialogDescription>Deseja sair da plataforma?</DialogDescription>
      </DialogHeader>
      <DialogFooter className="flex flex-row gap-3">
        <DialogClose asChild>
          <Button variant="secondary" className="w-full">
            Cancelar
          </Button>
        </DialogClose>
        <DialogClose className="w-full">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handLelogoutCLick}
          >
            Sair
          </Button>
        </DialogClose>
      </DialogFooter>
    </>
  )
}

export default SignOutDialog
