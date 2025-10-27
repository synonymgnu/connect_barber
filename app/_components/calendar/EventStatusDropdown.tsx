'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const statusOptions = [
  { value: 'agendado', label: 'Agendado', color: 'bg-[#8161FF]' },
  { value: 'confirmado', label: 'Confirmado', color: 'bg-green-500' },
  { value: 'faltou', label: 'Faltou', color: 'bg-red-500' },
] as const;

interface EventStatusDropdownProps {
  currentStatus: string;
  onStatusChange: (status: string) => void;
}

export function EventStatusDropdown({ currentStatus, onStatusChange }: EventStatusDropdownProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger
        className="text-xs opacity-80 hover:opacity-100 focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        aria-label="Alterar status"
      >
        ⋯
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        className="bg-[#1E1E1E] border border-[#333] rounded-md shadow-lg py-1 z-[9999] min-w-[140px] text-sm"
        sideOffset={5}
        align="end"
      >
        {statusOptions.map((option) => (
          <DropdownMenu.Item
            key={option.value}
            className={`px-3 py-2 cursor-pointer hover:bg-[#2A2A2A] flex items-center gap-2 ${
              currentStatus === option.value ? 'font-bold' : ''
            }`}
            onSelect={() => {
              onStatusChange(option.value);
              setOpen(false);
            }}
          >
            <span className={`w-2 h-2 rounded-full ${option.color}`} />
            {option.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}