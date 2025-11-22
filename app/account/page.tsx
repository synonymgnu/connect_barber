import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { redirect } from 'next/navigation'
import Header from '../_components/header'
import { Avatar, AvatarImage } from '../_components/ui/avatar'
import { Dialog, DialogContent, DialogTrigger } from '../_components/ui/dialog'
import { Button } from '../_components/ui/button'
import { LogOutIcon, Trash2 } from 'lucide-react'
import SignOutDialog from '../_components/sign-out-dialog'
import DeleteAccountDialog from '../_components/delete-account-dialog'
import EditPhoneForm from '../_components/edit-phone-form'
import AccountInfo from '../_components/account/account-info'
import { db } from '../_lib/prisma'

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return redirect('/')
  }

  const user = session.user

  const bookings = await db.booking.findMany({
    where: { userId: user.id },
    include: { service: true },
    orderBy: { date: 'desc' },
  })

  let barberStatus: 'ACTIVE' | 'INACTIVE' | null = null

  if (user.role === 'BARBER') {
    const barber = await db.barber.findUnique({
      where: { userId: user.id },
    })
    barberStatus = barber?.isActive ? 'ACTIVE' : 'INACTIVE'
  }

  return (
    <>
      <Header />

      <div className="flex flex-col lg:flex-row px-5 pt-5 lg:pt-16 lg:px-32 gap-10">
        {/* ========= ESQUERDA ========= */}
        <div className="flex flex-col lg:w-[300px]">
          <h1 className="text-2xl font-semibold">Gerenciar Conta</h1>
          <p className="text-muted-foreground mt-1">
            Configure suas informações pessoais ou exclua sua conta.
          </p>
          <div className="flex lg:flex-col flex-row items-center gap-2 mt-10 lg:gap-0 lg:mt-0 lg:items-start">
            <Avatar className="lg:mt-10 w-20 h-20 lg:w-60 lg:h-60">
              <AvatarImage src={user.image ?? ''} />
            </Avatar>
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-semibold lg:mt-5">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* ===== EDITAR TELEFONE ===== */}
          <div className="mt-6">
            <EditPhoneForm userId={user.id} initialPhone={user.phone ?? ''} />
          </div>

          {/* ===== BOTÃO SAIR ===== */}
          <Dialog>
            <DialogTrigger asChild className="w-full mt-5">
              <Button
                variant="secondary"
                className="gap-2 justify-center w-full text-left"
              >
                <LogOutIcon size={18} />
                Sair da Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] lg:w-[30%] rounded-lg">
              <SignOutDialog />
            </DialogContent>
          </Dialog>

          {/* ===== BOTÃO EXCLUIR ===== */}
          <Dialog>
            <DialogTrigger asChild className="w-full mt-5 hidden lg:flex">
              <Button
                variant="destructive"
                className="gap-2 justify-center w-full text-left"
              >
                <Trash2 size={18} />
                Excluir conta
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[35%] max-w-[500px]">
              <DeleteAccountDialog userId={user.id} role={user.role} />
            </DialogContent>
          </Dialog>
        </div>

        <AccountInfo
          user={user}
          bookings={bookings}
          barberStatus={barberStatus}
        />

        {/* ===== BOTÃO EXCLUIR ===== */}
        <Dialog>
          <DialogTrigger asChild className="w-full mt-5 lg:hidden">
            <Button
              variant="destructive"
              className="gap-2 justify-center w-full text-left"
            >
              <Trash2 size={18} />
              Excluir conta
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-lg">
            <DeleteAccountDialog userId={user.id} role={user.role} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
