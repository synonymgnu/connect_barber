import { Metadata } from 'next'
import UnifiedCalendar from '@/app/_components/calendar/unified-calendar'
import AuthCheck from '@/app/_components/auth-check'

export const metadata: Metadata = {
  title: 'Agenda - Connect Barber',
}

export default function AdminCalendarPage() {
  return (
    <AuthCheck requiredRole="ADMIN">
      <UnifiedCalendar role="ADMIN" />
    </AuthCheck>
  )
}