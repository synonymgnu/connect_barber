'use client'

import { usePathname } from 'next/navigation'
import { Card, CardContent } from './ui/card'

const Footer = () => {
  const pathname = usePathname()

  const isDashboard = pathname.startsWith('/dashboard')

  if (isDashboard) return null

  return (
    <footer>
      <Card className="mt-5 lg:mt-24">
        <CardContent className="px-5 py-6">
          <p className="text-sm text-gray-400">
            © 2025 - {new Date().getFullYear()} Copyright{' '}
            <span className="font-bold">Connect Barber</span>
          </p>
        </CardContent>
      </Card>
    </footer>
  )
}

export default Footer
