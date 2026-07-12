'use client'

import { useState } from 'react'
import { Clock3 } from 'lucide-react'
import { Button } from './ui/button'

interface Props {
  scheduleMap: Record<
    number,
    {
      startTime: string
      endTime: string
    }
  >
}

const DAYS = [
  { short: 'Dom', full: 'Domingo' },
  { short: 'Seg', full: 'Segunda' },
  { short: 'Ter', full: 'Terça' },
  { short: 'Qua', full: 'Quarta' },
  { short: 'Qui', full: 'Quinta' },
  { short: 'Sex', full: 'Sexta' },
  { short: 'Sáb', full: 'Sábado' },
]

export default function OpeningHoursMobile({ scheduleMap }: Props) {
  const initialDay = new Date().getDay()

  const [selectedDay, setSelectedDay] = useState(initialDay)

  const schedule = scheduleMap[selectedDay]

  const hasAnySchedule = Object.keys(scheduleMap).length > 0

  return (
    <div className="p-5 border-b border-zinc-800 md:hidden">
      <div className="mb-4 flex items-center gap-2">
        <Clock3 className="h-4 w-4 text-primary" />
        <span className="font-bold uppercase text-gray-400 text-xs  lg:text-sm">
          Funcionamento
        </span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center">
        {DAYS.map((day, index) => {
          const opened = !!scheduleMap[index]
          const selected = selectedDay === index

          return (
            <Button
              key={day.short}
              onClick={() => setSelectedDay(index)}
              disabled={!opened}
              className={`min-w-[40px]  rounded-full px-[9px] py-2 text-xs font-semibold transition-all duration-200 text-center justify-center
                    ${
                      opened
                        ? selected
                          ? 'bg-primary text-black scale-105'
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-zinc-900 text-zinc-600'
                    }`}
            >
              {day.short}
            </Button>
          )
        })}
      </div>

      <div className="mt-5 rounded-xl bg-zinc-900 p-4 text-center">
        {schedule && (
          <p className="text-xs uppercase text-zinc-400">
            {DAYS[selectedDay].full}
          </p>
        )}

        {hasAnySchedule ? (
          schedule ? (
            <p className="mt-1 text-lg font-bold text-primary">
              {schedule.startTime} às {schedule.endTime}
            </p>
          ) : (
            <p className="mt-1 text-base font-semibold text-zinc-500">
              Fechado
            </p>
          )
        ) : (
          <p className="mt-1 text-base font-semibold text-zinc-500">
            Sem horário cadastrado
          </p>
        )}
      </div>
    </div>
  )
}
