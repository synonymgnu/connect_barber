import { BookingStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Aguardando confirmação', variant: 'outline' },
  CONFIRMED: { label: 'Confirmado', variant: 'default' },
  COMPLETED: { label: 'Finalizado', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  NO_SHOW: { label: 'Não compareceu', variant: 'destructive' },
}

export const CANCELABLE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED']
