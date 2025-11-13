'use client'

import { useState } from 'react'
import CalendarView from '../../_components/calendar/CalendarView'
import EventDetailsPanel from '../../_components/calendar/EventDetailsPanel'
import CalendarStyles from '../../_components/calendar/calendar-styles'
import { getEventColorByStatus } from './utils'
import HeaderAdmin from '@/app/_components/dashboard/header-admin'
import { AdminSidebar } from '@/app/_components/dashboard/admin-sidebar'

const initialEvents = [
  {
    id: '1',
    title: 'Corte + Barba - João',
    start: '2025-10-28T09:00:00',
    end: '2025-10-28T09:30:00',
    backgroundColor: getEventColorByStatus('agendado'),
    extendedProps: {
      service: 'Corte e barba',
      customer: 'João Silva',
      phone: '(11) 99999-9999',
      status: 'agendado',
    },
  },
  {
    id: '2',
    title: 'Barba - Pedro',
    start: '2025-10-28T10:30:00',
    end: '2025-10-28T11:00:00',
    backgroundColor: getEventColorByStatus('confirmado'),
    extendedProps: {
      service: 'Barba',
      customer: 'Pedro Almeida',
      phone: '(11) 88888-8888',
      status: 'confirmado',
    },
  },
]

export default function CalendarPage() {
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  return (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        <main className="flex-1 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6 text-[#8161FF]">Agenda</h1>
          <CalendarStyles />
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-[#151515] rounded-xl border border-[#2A2A2A] overflow-hidden">
              <CalendarView
                initialEvents={initialEvents}
                onEventSelect={setSelectedEvent}
              />
            </div>
            <EventDetailsPanel
              selectedEvent={selectedEvent}
              onClose={() => setSelectedEvent(null)}
            />
          </div>
        </main>
      </div>
    </>
  )
}
