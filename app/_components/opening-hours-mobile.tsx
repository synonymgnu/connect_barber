'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/app/_components/ui/card'
import { Clock3 } from 'lucide-react'

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
  const initialDay =
    DAYS.findIndex((_, i) => scheduleMap[i]) !== -1
      ? DAYS.findIndex((_, i) => scheduleMap[i])
      : new Date().getDay()

  const [selectedDay, setSelectedDay] = useState(initialDay)

  const schedule = scheduleMap[selectedDay]

  return (
    <div className="p-5 border-b border-zinc-800 md:hidden">
      <Card className="border-0">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Funcionamento</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {DAYS.map((day, index) => {
              const opened = !!scheduleMap[index]
              const selected = selectedDay === index

              return (
                <button
                  key={day.short}
                  onClick={() => opened && setSelectedDay(index)}
                  disabled={!opened}
                  className={`min-w-[58px] rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200
                    ${
                      opened
                        ? selected
                          ? 'bg-primary text-black scale-105'
                          : 'bg-primary/20 text-primary hover:bg-primary/30'
                        : 'bg-zinc-900 text-zinc-600'
                    }`}
                >
                  {day.short}
                </button>
              )
            })}
          </div>

          <div className="mt-5 rounded-xl bg-zinc-900 p-4 text-center">
            <p className="text-xs uppercase text-zinc-400">
              {DAYS[selectedDay].full}
            </p>

            {schedule ? (
              <p className="mt-1 text-lg font-bold text-primary">
                {schedule.startTime} às {schedule.endTime}
              </p>
            ) : (
              <p className="mt-1 text-base font-semibold text-zinc-500">
                Fechado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
