"use client"

import { useState } from "react"
import { Calendar } from "../ui/calendar"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"
import { Button } from "../ui/button"
import { Calendar as CalendarIcon } from "lucide-react"

export default function ReportsHeader() {
  const [date, setDate] = useState<Date>(new Date())

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white">Relatórios</h1>
        <p className="text-slate-400 mt-1">Acompanhe o desempenho da sua barbearia</p>
      </div>

      {/* Calendário */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="bg-[#0f0f0f] border-[#1f1f1f] text-white hover:bg-[#1a1a1a] w-[280px] justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, "MMMM yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#0c0c0c] border-[#1f1f1f]" align="end">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            locale={ptBR}
            className="bg-[#0c0c0c] text-white"
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}