'use client';

import { EventStatusDropdown } from '../../_components/calendar/EventStatusDropdown';

interface EventCardProps {
  event: any;
  timeText: string;
  updateEventStatus: (eventId: string, status: string) => void;
}

export default function EventCard({ event, timeText, updateEventStatus }: EventCardProps) {
  const currentStatus = event.extendedProps.status || 'agendado';

  return (
    <div className="w-full h-full flex items-center justify-between px-2 overflow-visible">
      <div className="flex items-center gap-2">
        <span className="text-[#BDBDBD] text-xs font-mono">{timeText}</span>
        <span className="font-medium flex-1 truncate">{event.title}</span>
      </div>
      <EventStatusDropdown
        currentStatus={currentStatus}
        onStatusChange={(newStatus) => updateEventStatus(event.id, newStatus)}
      />
    </div>
  );
}