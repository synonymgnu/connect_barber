import { BookingStatus } from "@prisma/client"

export const getEventColorByStatus = (status: BookingStatus): string => {
  switch (status) {
    case BookingStatus.PENDING:  return '#f59e0b'
    case BookingStatus.CONFIRMED: return '#8161FF'
    case BookingStatus.COMPLETED: return '#10b981'
    case BookingStatus.CANCELLED: return '#ef4444'
    default: return '#8161FF'
  }
}

// Helper para traduzir
export const translateStatus = (status: BookingStatus): string => {
  const translations: Record<BookingStatus, string> = {
    [BookingStatus.PENDING]: 'Pendente',
    [BookingStatus.CONFIRMED]: 'Confirmado',
    [BookingStatus.COMPLETED]: 'Concluído',
    [BookingStatus.CANCELLED]: 'Cancelado',
  }
  return translations[status]
}