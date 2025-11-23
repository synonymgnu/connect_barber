import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { Toaster } from 'sonner'
import Footer from './_components/footer'
import AuthProvider from './_providers/auth'
import { Providers } from './_components/providers'
import QueryProvider from './_providers/query-provider'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Connect Barber',
  description: 'Sistema de agendamento para barbearias',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <AuthProvider>
            <Providers>
              <div className="flex flex-col h-full">
                <div className="flex-1">{children}</div>
                <Footer />
              </div>
            </Providers>
          </AuthProvider>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  )
}