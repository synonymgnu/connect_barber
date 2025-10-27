'use client';

import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import ptBrLocale from '@fullcalendar/core/locales/pt-br';
import EventCard from '../../dashboard/calendar/EventCard';
import { getEventColorByStatus } from '../../dashboard/calendar/utils';

interface CalendarViewProps {
  initialEvents: any[];
  onEventSelect: (event: any) => void;
}

export default function CalendarView({ initialEvents, onEventSelect }: CalendarViewProps) {
  const [events, setEvents] = useState(initialEvents);

  const updateEventStatus = (eventId: string, newStatus: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === eventId
          ? {
              ...event,
              backgroundColor: getEventColorByStatus(newStatus),
              extendedProps: {
                ...event.extendedProps,
                status: newStatus,
              },
            }
          : event
      )
    );
  };

  const handleDateClick = (arg: any) => {
    const title = prompt('Nome do cliente:');
    if (!title) return;
    const service = prompt('Serviço:');
    if (!service) return;
    const phone = prompt('Telefone do cliente:') || '';

    const newEvent = {
      id: `${events.length + 1}`,
      title: `${service} - ${title}`,
      start: arg.date.toISOString(),
      end: new Date(arg.date.getTime() + 30 * 60000).toISOString(),
      backgroundColor: getEventColorByStatus('agendado'),
      extendedProps: {
        service,
        customer: title,
        phone,
        status: 'agendado',
      },
    };
    setEvents([...events, newEvent]);
  };

  const handleEventDrop = (dropInfo: any) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === dropInfo.event.id
          ? { ...event, start: dropInfo.event.start, end: dropInfo.event.end }
          : event
      )
    );
  };

  const handleEventClick = (clickInfo: any) => {
    const event = clickInfo.event;
    onEventSelect({
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      ...event.extendedProps,
    });
  };

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="timeGridWeek"
      headerToolbar={{
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      }}
      events={events}
      eventContent={({ event, timeText }) => (
        <EventCard
          event={event}
          timeText={timeText}
          updateEventStatus={updateEventStatus}
        />
      )}
      selectable
      editable={true}
      eventDrop={handleEventDrop}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      locale={ptBrLocale}
      slotMinTime="08:00:00"
      slotMaxTime="20:00:00"
      height="auto"
    />
  );
}