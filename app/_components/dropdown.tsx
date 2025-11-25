import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState, useRef } from 'react';

interface DropDownProps {
  event: any;
  updateEventStatus: (id: string, status: string) => void;
}

const statusConfig = {
  agendado: { label: 'Agendado', color: 'bg-yellow-500' },
  confirmado: { label: 'Confirmado', color: 'bg-blue-500' },
  faltou: { label: 'Faltou', color: 'bg-red-500' },
};

const DropDown = ({ event, updateEventStatus }: DropDownProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
  
    const currentStatus = event.extendedProps.status || 'agendado';
  
    return (
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger
          ref={triggerRef}
          className="w-full h-full flex items-center justify-between px-2"
          onClick={(e) => e.stopPropagation()} // evita abrir o modal padrão do FullCalendar
        >
          <span>{event.title}</span>
          <span className="text-xs opacity-80">⋯</span>
        </DropdownMenu.Trigger>
  
        <DropdownMenu.Content
          className="bg-[#1E1E1E] border border-[#333] rounded-md shadow-lg py-1 z-[9999] min-w-[140px]"
          sideOffset={5}
          align="end"
        >
          {(['agendado', 'confirmado', 'faltou'] as const).map((status) => (
            <DropdownMenu.Item
              key={status}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-[#2A2A2A] flex items-center gap-2 ${
                currentStatus === status ? 'font-bold' : ''
              }`}
              onSelect={() => {
                updateEventStatus(event.id, status);
                setOpen(false);
              }}
            >
              <span className={`w-2 h-2 rounded-full ${statusConfig[status].color}`}></span>
              {statusConfig[status].label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    );
  };

  export default DropDown;