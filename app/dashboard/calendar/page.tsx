'use client'

import { useRouter } from 'next/navigation'
import NotionCalendar from '@/app/_components/calendar/notion-calendar'
import AuthCheck from '@/app/_components/auth-check'

export default function AdminCalendarPage() {
  const router = useRouter()

  return (
    <AuthCheck requiredRole="ADMIN">
      <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
        <NotionCalendar
          role="ADMIN"
          onExit={() => router.push('/dashboard')}
        />
      </div>
    </AuthCheck>
  )
}
