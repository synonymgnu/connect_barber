'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Calendar } from '@/app/_components/ui/calendar'
import { format, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface WorkSchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface Absence {
  id: string
  date: Date
  reason: string
  isAllDay: boolean
}

export function AvailabilityCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [schedulesRes, absencesRes] = await Promise.all([
        fetch('/api/availability/schedule'),
        fetch('/api/availability/absences')
      ])
      
      if (!schedulesRes.ok || !absencesRes.ok) throw new Error('Erro ao carregar dados')
      
      const schedules = await schedulesRes.json()
      const absencesData = await absencesRes.json()
      
      setWorkSchedules(schedules)
      setAbsences(absencesData.map((a: any) => ({
        ...a,
        date: new Date(a.date)
      })))
    } catch (error) {
      toast.error('Erro ao carregar disponibilidade')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getDayAvailability = (date: Date) => {
    const dayOfWeek = date.getDay()
    const isAbsent = absences.some(a => isSameDay(a.date, date))
    const schedule = workSchedules.find(s => s.dayOfWeek === dayOfWeek)
    
    return {
      isWorkingDay: schedule?.isActive && !isAbsent,
      schedule,
      isAbsent,
      absence: absences.find(a => isSameDay(a.date, date))
    }
  }

  if (loading) {
    return (
      <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
        <CardContent className="flex justify-center py-8">
          <Clock className="h-8 w-8 animate-spin text-slate-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
        <CardHeader>
          <CardTitle className="text-white">Visualização Mensal</CardTitle>
          <p className="text-sm text-slate-400">
            {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            className="bg-[#0c0c0c] text-white"
            modifiers={{
              working: (date) => getDayAvailability(date).isWorkingDay,
              absent: (date) => getDayAvailability(date).isAbsent,
              weekend: (date) => date.getDay() === 0 || date.getDay() === 6
            }}
            modifiersStyles={{
              working: {
                backgroundColor: '#8161FF',
                color: 'white',
                fontWeight: 'bold'
              },
              absent: {
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                textDecoration: 'line-through'
              },
              weekend: {
                color: '#94a3b8'
              }
            }}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardHeader>
            <CardTitle className="text-sm text-white">Legenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-[#8161FF] rounded"></div>
              <span className="text-sm text-slate-300">Dia de trabalho</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500/20 border border-red-500 rounded"></div>
              <span className="text-sm text-slate-300">Ausência marcada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-transparent rounded"></div>
              <span className="text-sm text-slate-300">Dia sem expediente</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardHeader>
            <CardTitle className="text-sm text-white">Próximos Dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {eachDayOfInterval({
              start: new Date(),
              end: endOfMonth(selectedMonth)
            }).slice(0, 10).map(date => {
              const availability = getDayAvailability(date)
              return (
                <div key={date.toString()} className="flex items-center justify-between p-2 rounded bg-[#0c0c0c]">
                  <div className="flex items-center gap-2">
                    {availability.isAbsent ? (
                      <X className="h-4 w-4 text-red-400" />
                    ) : availability.isWorkingDay ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Clock className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="text-sm text-white">
                      {format(date, "EEEE, dd/MM", { locale: ptBR })}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {availability.isAbsent ? (
                      'Ausente'
                    ) : availability.isWorkingDay ? (
                      `${availability.schedule?.startTime} - ${availability.schedule?.endTime}`
                    ) : (
                      'Fechado'
                    )}
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}