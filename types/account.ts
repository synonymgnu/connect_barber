// types/account.ts

import { UserRole } from '@prisma/client'

export interface AccountBooking {
  id: string
  date: string | Date
  service: {
    name: string
  }
}

export interface AccountInfoProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    phone?: string | null
    role: UserRole
    image?: string | null
  }
  bookings: AccountBooking[]
  barberStatus?: 'ACTIVE' | 'INACTIVE' | null
}
