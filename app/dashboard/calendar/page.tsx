import { Metadata } from 'next'
import UnifiedCalendar from '@/app/_components/calendar/unified-calendar'
import AuthCheck from '@/app/_components/auth-check'

export const metadata: Metadata = {
  title: 'Agenda - Connect Barber',
}

export default function AdminCalendarPage() {
  return (
    <AuthCheck requiredRole="ADMIN">
      <div className="min-h-screen bg-background overflow-x-hidden">
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Agenda da Barbearia</h1>
            <p className="text-gray-400 mt-1">Gerencie todos os agendamentos dos seus barbeiros</p>
          </div>
          <UnifiedCalendar role="ADMIN" />
        </main>
      </div>
    </AuthCheck>
  )
}