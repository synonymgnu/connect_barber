import { PrismaAdapter } from '@auth/prisma-adapter'
import { AuthOptions } from 'next-auth'
import { db } from './prisma'
import { Adapter } from 'next-auth/adapters'
import GoogleProvider from 'next-auth/providers/google'

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
      if (account?.provider === "google") {
        try {
          // Verificar se já existe um usuário com este email
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
            include: {
              barber: {
                select: { id: true }
              }
            }
          })

          if (existingUser) {
            // Verificar se o usuário já tem uma conta Google vinculada
            const existingAccount = await db.account.findFirst({
              where: {
                userId: existingUser.id,
                provider: "google",
              }
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
                }
              })
            }
            
            const updateData: any = {}
            if (profile?.image && !existingUser.image) {
              updateData.image = profile.image
            }
            if (profile?.name && !existingUser.name) {
              updateData.name = profile.name
            }

            if (Object.keys(updateData).length > 0) {
              await db.user.update({
                where: { id: existingUser.id },
                data: updateData
              })
            }

            user.id = existingUser.id
            return true
          }
          
          return true
          
        } catch (error) {
          console.error("Error in signIn callback:", error)
          return false
        }
      }
      return true
    },

    async session({ session, user, token }) {
      if (session.user) {
        const userId = user?.id || token.sub
        
        if (userId) {
          const dbUser = await db.user.findUnique({
            where: { id: userId },
            include: {
              barber: {
                select: { id: true }
              },
              ownedBarbershop: {
                select: { id: true }
              }
            }
          })
          
          if (dbUser) {
            session.user.id = dbUser.id
            session.user.role = dbUser.role
            session.user.name = dbUser.name
            session.user.email = dbUser.email
            session.user.image = dbUser.image
            session.user.barberId = dbUser.barber?.id || null
            session.user.barbershopId = dbUser.ownedBarbershop?.id || null
          }
        }
      }
      return session
    },
    
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.role = user.role
        token.barberId = (user as any).barberId
        token.barbershopId = (user as any).barbershopId
      }
      return token
    }
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