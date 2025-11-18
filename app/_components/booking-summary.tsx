import { format } from 'date-fns'
import { Card, CardContent } from './ui/card'
import { Barbershop, BarbershopService } from '@prisma/client'
import { ptBR } from 'date-fns/locale'
import { Avatar, AvatarImage } from './ui/avatar'

interface BookingSummaryProps {
  service: Pick<BarbershopService, 'name' | 'price'>
  barbershop: Pick<Barbershop, 'name'>
  selectedDate: Date
  barber?: { name: string } | null
}

const BookingSummary = ({
  service,
  barbershop,
  selectedDate,
  barber,
}: BookingSummaryProps) => {
  return (
    <Card>
      <CardContent className=" space-y-3 p-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold">{service.name}</h2>
          <p className="text-sm font-bold">
            {Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(Number(service.price))}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm text-gray-400">Data</h2>
          <p className="text-sm">
            {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm text-gray-400">Barbeiro</h2>
          <p className="text-sm"> {barber?.name ?? 'Não escolhido'}</p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm text-gray-400">Horário</h2>
          <p className="text-sm">{format(selectedDate, 'HH:mm')}</p>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-sm text-gray-400">Barbearia</h2>
          <p className="text-sm">{barbershop.name}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default BookingSummary
