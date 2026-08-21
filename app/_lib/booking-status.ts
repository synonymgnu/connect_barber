import { BookingStatus } from '@prisma/client'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export const BOOKING_STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; variant: BadgeVariant }
> = {
  CONFIRMED: { label: 'Confirmado', variant: 'default' },
  COMPLETED: { label: 'Finalizado', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
}

export const CANCELABLE_STATUSES: BookingStatus[] = ['CONFIRMED']

interface BookingForStatus {
  status: BookingStatus
  date: Date
  duration?: number | null
  service: { duration: number }
}

/**
 * "Confirmado" vira "Finalizado" automaticamente assim que o horário
 * reservado + a duração do serviço passam — não precisa de job/cron,
 * o cálculo acontece no momento em que os dados são exibidos.
 * "Cancelado" sempre tem prioridade (nunca "volta" a ser confirmado).
 */
export function getEffectiveStatus(booking: BookingForStatus): BookingStatus {
  if (booking.status === 'CANCELLED') return 'CANCELLED'

  const durationMinutes = booking.duration ?? booking.service.duration
  const endTime = new Date(booking.date).getTime() + durationMinutes * 60_000

  return Date.now() >= endTime ? 'COMPLETED' : 'CONFIRMED'
}
