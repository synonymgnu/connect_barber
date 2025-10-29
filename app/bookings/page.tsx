import { getServerSession } from 'next-auth'
import Header from '../_components/header'
import { authOptions } from '../_lib/auth'
import { notFound } from 'next/navigation'
import BookingItem from '../_components/booking-item'
import { getConfirmedBookings } from '../_data/get-confirmed-bookings'
import { getConcludedBookings } from '../_data/get-concluded-bookings'
import { Card, CardContent } from '../_components/ui/card'
import Image from 'next/image'
import { Avatar, AvatarImage } from '../_components/ui/avatar'
import { Badge } from '../_components/ui/badge'
import PhoneItem from '../_components/phone-item'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../_components/ui/dialog'
import { Button } from '../_components/ui/button'

const Bookings = async () => {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    //TODO: mostrar pop-up de login
    return notFound()
  }
  const confirmedBookings = await getConfirmedBookings()

  const concludedBookings = await getConcludedBookings()

  return (
    <>
      <Header isHidden="md:flex" />
      <div className=" space-y-3 px-5 pt-5 md:pt-10 md:px-64">
        <h1 className="font-bold text-xl md:text-2xl md:mb-2">Agendamentos</h1>
        {confirmedBookings.length == 0 && concludedBookings.length == 0 && (
          <p className="text-gray-400">Você não tem agendamentos.</p>
        )}
        <div className="md:flex md:gap-10">
          <div className="flex-1 space-y-3">
            {confirmedBookings.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                  Confirmados
                </h2>

                {confirmedBookings.map((booking) => (
                  <BookingItem
                    key={booking.id}
                    booking={JSON.parse(JSON.stringify(booking))}
                  />
                ))}
              </>
            )}
            {concludedBookings.length > 0 && (
              <>
                <h2 className="mb-3 mt-6 text-xs font-bold uppercase text-gray-400">
                  Finalizados
                </h2>
                {concludedBookings.map((booking) => (
                  <BookingItem
                    key={booking.id}
                    booking={JSON.parse(JSON.stringify(booking))}
                  />
                ))}
              </>
            )}
          </div>
          <Card className="hidden md:block mt-16 self-start w-[380px]">
            <CardContent>
              <div className="relative flex h-[180px] w-full items-end mt-6">
                <Image
                  alt={`Mapa da barbearia {}`}
                  src="map.png"
                  fill
                  className="object-cover rounded-xl"
                />

                <Card className="z-50 mx-5 mb-3 w-full rounded-xl">
                  <CardContent className="flex px-5 py-3 items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png" />
                    </Avatar>
                    <div>
                      <h3 className="font-bold">Barbearia Vintage</h3>
                      <p className="text-xs">Rua da Barbearia, 123</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <h2 className="font-bold uppercase text-sm mb-2.5 mt-5">
                Sobre nós
              </h2>
              <p className="text-sm text-zinc-300 text-justify border-b pb-5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
                ac augue ullamcorper, pharetra orci mollis, auctor tellus.
                Phasellus pharetra erat ac libero efficitur tempus. Donec
                pretium convallis iaculis. Etiam eu felis sollicitudin, cursus
                mi vitae, iaculis magna. Nam non erat neque. In hac habitasse
                platea dictumst. Pellentesque molestie accumsan tellus id
                laoreet.
              </p>

              <div className="space-y-3 mt-5">
                <PhoneItem phone="(11) 99999-9999" />
                <PhoneItem phone="(11) 99999-9999" />
              </div>

              <div className="mt-6">
                <Badge className="w-fit" variant="default">
                  Confirmado
                </Badge>

                <div className="mb-3 mt-6">
                  <Card>
                    <CardContent className="p-3 flex items-center justify-between">
                      {/* Esquerda */}
                      <div className="spacy-y-3">
                        <p className="font-bold">Corte de Cabelo</p>
                        <p className="text-gray-400 text-sm">Data</p>
                        <p className="text-gray-400 text-sm">Horário</p>
                        <p className="text-gray-400 text-sm">Barbearia</p>
                      </div>
                      {/* Direita */}
                      <div className="spacy-y-3">
                        <p className="font-bold text-sm">R$ 60,00</p>
                        <p className="text-gray-400 text-sm">30 De Outubro</p>
                        <p className="text-gray-400 text-sm">08:00</p>
                        <p className="text-gray-400 text-sm">
                          Barbearia Vintage
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Dialog>
                <DialogTrigger className="w-full">
                  <Button variant="destructive" className="w-full">
                    Cancelar reserva
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[90%]">
                  <DialogHeader>
                    <DialogTitle>Você deseja cancelar sua reserva?</DialogTitle>
                    <DialogDescription>
                      Ao cancelar, você perderá sua reserva e não poderá
                      recuperá-la. Essa ação é irreversível.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter className="flex flex-row gap-3">
                    <DialogClose asChild>
                      <Button variant="secondary" className="w-full">
                        Voltar
                      </Button>
                    </DialogClose>
                    <DialogClose className="w-full"></DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

export default Bookings
