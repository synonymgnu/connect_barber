import { PrismaAdapter } from '@auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import { db } from './prisma'
import { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'
import { hashEmail } from './encryption'

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Verificar se é login com Google
      if (account?.provider === 'google') {
        try {
          // Verificar se já existe um usuário com este email
          const existingUser = await db.user.findUnique({
            where: { emailHash: hashEmail(user.email!) },
            include: {
              barber: {
                select: { id: true },
              },
            },
          })

          if (existingUser) {
            // Verificar se o usuário já tem uma conta Google vinculada
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: 'google',
              },
            })

            if (!existingAccount) {
              // Vincular a conta Google ao usuário existente
              await db.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state as string,
                },
              })
            }

            const updateData: any = {}
            if (profile?.image) {
              updateData.image = profile.image
            }
            if (profile?.name && !existingUser.name) {
              updateData.name = profile.name
            }

            if (Object.keys(updateData).length > 0) {
              await db.user.update({
                where: { id: existingUser.id },
                data: updateData,
              })
            }

            user.id = existingUser.id
            return true
          }

          return true
        } catch (error) {
          console.error('Error in signIn callback:', error)
          return false
        }
      }
      return true
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        session.user.role = token.role as any
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
        session.user.phone = token.phone as string | null
        session.user.barberId = token.barberId as string | null
        session.user.barbershopId = token.barbershopId as string | null
      }
      return session
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          include: {
            barber: { select: { id: true } },
            ownedBarbershop: { select: { id: true } },
          },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.email = dbUser.email
          token.phone = dbUser.phone
          token.barberId = dbUser.barber?.id || null
          token.barbershopId = dbUser.ownedBarbershop?.id || null
        }
      }
      if (trigger === 'update') {
        const dbUser = await db.user.findUnique({
          where: { id: token.sub },
          include: {
            barber: { select: { id: true } },
            ownedBarbershop: { select: { id: true } },
          },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.email = dbUser.email
          token.phone = dbUser.phone
          token.barberId = dbUser.barber?.id || null
          token.barbershopId = dbUser.ownedBarbershop?.id || null
        }
      }
      return token
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}
