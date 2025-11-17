'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Calendar } from '@/app/_components/ui/calendar'
import { Button } from '@/app/_components/ui/button'
import { Badge } from '@/app/_components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/app/_components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/_components/ui/tooltip'
import { toast } from 'sonner'
import { format, endOfMonth, startOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Clock, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  CalendarOff, 
  Info,
  CalendarIcon
} from 'lucide-react'

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

interface DayInfo {
  isWorkingDay: boolean
  schedule?: WorkSchedule
  isAbsent: boolean
  absence?: Absence
}

// Componente personalizado para cada dia do calendário
interface DayCellProps {
  date: Date
  displayMonth: Date
}



// Custom hooks para evitar prop drilling
function useDayInfo(date: Date, workSchedules: WorkSchedule[], absences: Absence[]) {
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

function useSelectedDate(selectedDate: Date | null) {
  return (checkDate: Date) => selectedDate ? isSameDay(checkDate, selectedDate) : false
}

export function AvailabilityCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [monthStats, setMonthStats] = useState({ working: 0, absent: 0, closed: 0 })

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



  // Calcula estatísticas do mês
  useEffect(() => {
    const days = eachDayOfInterval({
      start: startOfMonth(selectedMonth),
      end: endOfMonth(selectedMonth)
    })

    const stats = { working: 0, absent: 0, closed: 0 }

    days.forEach(date => {
      const dayOfWeek = date.getDay()
      const isAbsent = absences.some(a => isSameDay(a.date, date))
      const schedule = workSchedules.find(s => s.dayOfWeek === dayOfWeek)

      if (isAbsent) {
        stats.absent++
      } else if (schedule?.isActive) {
        stats.working++
      } else {
        stats.closed++
      }
    })

    setMonthStats(stats)
  }, [selectedMonth, workSchedules, absences])

  const handlePreviousMonth = () => {
    setSelectedDate(null)
    setSelectedMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    setSelectedMonth(prev => addMonths(prev, 1))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Calendário de Disponibilidade</h2>
              <p className="text-sm text-slate-400 mt-1">
                Visualize e gerencie os dias de funcionamento da barbearia
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousMonth}
                className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-[#8161FF]/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <motion.h3 
                key={selectedMonth.toISOString()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-lg font-semibold text-white min-w-[200px] text-center"
              >
                {format(selectedMonth, "MMMM 'de' yyyy", { locale: ptBR })}
              </motion.h3>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextMonth}
                className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-[#8161FF]/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Dias de Trabalho</p>
                <p className="text-2xl font-bold text-green-400">{monthStats.working}</p>
              </div>
              <Check className="w-8 h-8 text-green-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Ausências</p>
                <p className="text-2xl font-bold text-red-400">{monthStats.absent}</p>
              </div>
              <X className="w-8 h-8 text-red-400/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Dias Fechados</p>
                <p className="text-2xl font-bold text-slate-400">{monthStats.closed}</p>
              </div>
              <CalendarOff className="w-8 h-8 text-slate-400/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 bg-[#0f0f0f] border-[#1f1f1f]">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Visualização Mensal</CardTitle>
            <Badge variant="outline" className="bg-[#8161FF]/20 text-[#8161FF] border-[#8161FF]/30">
              {monthStats.working + monthStats.absent + monthStats.closed} dias
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="bg-[#0c0c0c] text-white p-4 rounded-lg">
              {/* Header dos dias da semana */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                  <div key={day} className="text-slate-400 text-sm font-medium text-center py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Grid dos dias */}
              <div className="grid grid-cols-7 gap-2">
                {eachDayOfInterval({
                  start: startOfMonth(selectedMonth),
                  end: endOfMonth(selectedMonth)
                }).map((date) => {
                  const dayInfo = useDayInfo(date, workSchedules, absences)
                  const isSelected = useSelectedDate(selectedDate)
                  const isCurrentMonth = date.getMonth() === selectedMonth.getMonth()

                  const baseClasses = "relative w-full h-16 flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer"

                  const getDayClassName = () => {
                    if (!isCurrentMonth) {
                      return `${baseClasses} opacity-30`
                    }
                    
                    if (isSelected(date)) {
                      return `${baseClasses} ring-2 ring-white bg-[#8161FF]/30`
                    }
                    
                    if (isToday(date)) {
                      return `${baseClasses} ring-2 ring-[#8161FF] bg-[#8161FF]/20`
                    }
                    
                    if (dayInfo.isAbsent) {
                      return `${baseClasses} bg-red-500/20 hover:bg-red-500/30 text-red-300`
                    }
                    
                    if (dayInfo.isWorkingDay) {
                      return `${baseClasses} bg-[#8161FF]/20 hover:bg-[#8161FF]/30 text-white`
                    }
                    
                    return `${baseClasses} bg-[#0c0c0c]/50 text-slate-500 hover:bg-[#0c0c0c]/70`
                  }

                  return (
                    <TooltipProvider key={date.toISOString()}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={getDayClassName()}
                            onClick={() => setSelectedDate(date)}
                          >
                            <span className="text-sm font-medium">{format(date, 'd')}</span>
                            
                            <div className="flex gap-1 mt-1">
                              {dayInfo.isAbsent && (
                                <X className="w-3 h-3 text-red-400" />
                              )}
                              {dayInfo.isWorkingDay && (
                                <div className="w-2 h-2 bg-[#8161FF] rounded-full" />
                              )}
                            </div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white p-3">
                          <div className="space-y-1">
                            <p className="font-medium">{format(date, "EEEE, dd/MM/yyyy", { locale: ptBR })}</p>
                            {dayInfo.isAbsent ? (
                              <>
                                <p className="text-red-400">❌ Ausência marcada</p>
                                {dayInfo.absence?.reason && <p className="text-sm text-slate-300">{dayInfo.absence.reason}</p>}
                              </>
                            ) : dayInfo.isWorkingDay ? (
                              <p className="text-[#8161FF]">✅ {dayInfo.schedule?.startTime} - {dayInfo.schedule?.endTime}</p>
                            ) : (
                              <p className="text-slate-400">⏸️ Fechado</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Panel */}
        <AnimatePresence mode="wait">
          {selectedDate ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-fit"
            >
              <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    Detalhes do Dia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Data</p>
                    <p className="text-lg font-medium text-white">
                      {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  </div>

                  {(() => {
                    const dayInfo = useDayInfo(selectedDate)
                    const isSelected = useSelectedDate(selectedDate)
                    
                    if (dayInfo.isAbsent) {
                      return (
                        <>
                          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                            <div className="flex items-center gap-2 text-red-400 mb-2">
                              <X className="w-5 h-5" />
                              <span className="font-medium">Ausência Marcada</span>
                            </div>
                            {dayInfo.absence?.reason && (
                              <p className="text-sm text-slate-300">{dayInfo.absence.reason}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              {dayInfo.absence?.isAllDay ? 'Dia todo' : 'Período parcial'}
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500"
                          >
                            Remover Ausência
                          </Button>
                        </>
                      )
                    }

                    if (dayInfo.isWorkingDay) {
                      return (
                        <>
                          <div className="p-4 rounded-lg bg-[#8161FF]/20 border border-[#8161FF]/30">
                            <div className="flex items-center gap-2 text-[#8161FF] mb-2">
                              <Clock className="w-5 h-5" />
                              <span className="font-medium">Dia de Trabalho</span>
                            </div>
                            <p className="text-sm text-white">
                              Expediente: {dayInfo.schedule?.startTime} às {dayInfo.schedule?.endTime}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-[#8161FF]/20"
                            >
                              Editar Horário
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500"
                            >
                              Marcar Ausência
                            </Button>
                          </div>
                        </>
                      )
                    }

                    return (
                      <div className="p-4 rounded-lg bg-[#0c0c0c] border border-[#1f1f1f] text-center">
                        <CalendarOff className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                        <p className="text-sm text-slate-300">Dia sem expediente</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure os horários na aba "Horários de Trabalho"
                        </p>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex items-center justify-center"
            >
              <Card className="bg-[#0f0f0f] border-[#1f1f1f] w-full">
                <CardContent className="py-12 px-6 text-center">
                  <Info className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-300 mb-2">Nenhum dia selecionado</p>
                  <p className="text-sm text-slate-500">
                    Clique em um dia do calendário para ver detalhes
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}