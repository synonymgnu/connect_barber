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
    name: string | null
    email: string
    image: string | null
    role: UserRole
  }
  bookings: Array<{
    id: string
    date: Date
    service: { name: string }
  }>
  barberStatus: 'ACTIVE' | 'INACTIVE' | null
  barbershop: {
    id: string
    name: string
    address: string
    images: string[]
  } | null
}
