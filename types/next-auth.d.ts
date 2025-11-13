// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: UserRole
      barberId?: string | null
    } & DefaultSession['user']
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    barberId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    barberId?: string | null
  }
}