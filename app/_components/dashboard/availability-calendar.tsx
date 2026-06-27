'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
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
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Clock, 
  X, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  CalendarOff, 
  Info,
  CalendarIcon,
  Users,
  UserX,
  AlertCircle,
  Store
} from 'lucide-react'

interface WorkSchedule {
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive?: boolean
}

interface Absence {
  id: string
  date: Date
  reason: string
  isAllDay: boolean
  barberId: string | null
  barberName: string | null
  type: 'BARBER_ABSENCE' | 'SHOP_CLOSURE'
}

interface Barber {
  id: string
  name: string
}

interface DayInfo {
  isWorkingDay: boolean
  schedule?: WorkSchedule
  shopClosures: Absence[]
  barberAbsences: Absence[]
  availableBarbers: number
  totalBarbers: number
}

interface BarberInfo {
  id: string
  name: string
  schedule: WorkSchedule | undefined
  isAbsent: boolean
  absence?: Absence
}

// Helper functions
function getDayInfo(date: Date, workSchedules: WorkSchedule[], absences: Absence[], barbers: Barber[]): DayInfo {
  const dayOfWeek = date.getDay()
  const dayAbsences = absences.filter(a => isSameDay(a.date, date))
  const shopClosures = dayAbsences.filter(a => a.type === 'SHOP_CLOSURE')
  const barberAbsences = dayAbsences.filter(a => a.type === 'BARBER_ABSENCE')
  // workSchedules aqui são os BarbershopHours — isActive pode ser undefined se vier sem o campo
  const schedule = workSchedules.find(s => s.dayOfWeek === dayOfWeek)
  const isWorkingDay = !!schedule && shopClosures.length === 0

  const availableBarbers = barbers.filter(barber => {
    const barberAbsence = barberAbsences.find(a => a.barberId === barber.id)
    return !barberAbsence
  }).length

  return {
    isWorkingDay,
    schedule,
    shopClosures,
    barberAbsences,
    availableBarbers,
    totalBarbers: barbers.length
  }
}

function getBarberInfo(barber: Barber, date: Date, absences: Absence[]): BarberInfo {
  const absence = absences.find(a => isSameDay(a.date, date) && a.barberId === barber.id && a.type === 'BARBER_ABSENCE')

  return {
    id: barber.id,
    name: barber.name,
    schedule: undefined,
    isAbsent: !!absence,
    absence
  }
}

function isDateSelected(selectedDate: Date | null, checkDate: Date) {
  return selectedDate ? isSameDay(checkDate, selectedDate) : false
}

export function AvailabilityCalendar() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [workSchedules, setWorkSchedules] = useState<WorkSchedule[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [monthStats, setMonthStats] = useState({ working: 0, absent: 0, closed: 0 })
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [showAbsenceModal, setShowAbsenceModal] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const [schedulesRes, absencesRes, barbersRes] = await Promise.all([
        fetch('/api/availability/schedule?type=shop'),
        fetch('/api/availability/absences'),
        fetch('/api/barbershop/barbers')
      ])
      
      if (!schedulesRes.ok || !absencesRes.ok || !barbersRes.ok) {
        throw new Error('Erro ao carregar dados')
      }
      
      const schedules = await schedulesRes.json()
      const absencesData = await absencesRes.json()
      const barbersData = await barbersRes.json()
      
      setWorkSchedules(schedules)
      setAbsences(absencesData.map((a: any) => ({
        ...a,
        date: new Date(a.date)
      })))
      setBarbers(barbersData)
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
      const dayInfo = getDayInfo(date, workSchedules, absences, barbers)
      
      if (dayInfo.shopClosures.length > 0) {
        stats.closed++
      } else if (dayInfo.isWorkingDay) {
        if (dayInfo.barberAbsences.length === 0) {
          stats.working++
        } else {
          stats.absent++
        }
      } else {
        stats.closed++
      }
    })

    setMonthStats(stats)
  }, [selectedMonth, workSchedules, absences, barbers])

  const handlePreviousMonth = () => {
    setSelectedDate(null)
    setSelectedMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setSelectedDate(null)
    setSelectedMonth(prev => addMonths(prev, 1))
  }

  const openAbsenceModalWithDate = (date: Date) => {
    setSelectedDate(date)
    setShowAbsenceModal(true)
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
                <p className="text-sm text-slate-400">Dias Completos</p>
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
                <p className="text-sm text-slate-400">Dias com Ausências</p>
                <p className="text-2xl font-bold text-yellow-400">{monthStats.absent}</p>
              </div>
              <UserX className="w-8 h-8 text-yellow-400/30" />
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
                  const dayInfo = getDayInfo(date, workSchedules, absences, barbers)
                  const isSelected = isDateSelected(selectedDate, date)
                  const isCurrentMonth = date.getMonth() === selectedMonth.getMonth()

                  const baseClasses = "relative w-full h-16 flex flex-col items-center justify-center p-2 rounded-lg transition-all cursor-pointer"

                  const getDayClassName = () => {
                    if (!isCurrentMonth) return `${baseClasses} opacity-30`
                    if (isSelected) return `${baseClasses} ring-2 ring-white bg-[#8161FF]/30`
                    if (isToday(date)) return `${baseClasses} ring-2 ring-[#8161FF] bg-[#8161FF]/20`
                    if (dayInfo.shopClosures.length > 0) {
                      return `${baseClasses} bg-blue-500/20 hover:bg-blue-500/30 text-blue-300`
                    }
                    if (!dayInfo.isWorkingDay) return `${baseClasses} bg-[#0c0c0c]/50 text-slate-500 hover:bg-[#0c0c0c]/70`
                    if (dayInfo.barberAbsences.length > 0) {
                      if (dayInfo.availableBarbers === 0) {
                        return `${baseClasses} bg-red-500/20 hover:bg-red-500/30 text-red-300`
                      }
                      return `${baseClasses} bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300`
                    }
                    return `${baseClasses} bg-green-500/20 hover:bg-green-500/30 text-green-300`
                  }

                  const getStatusIcon = () => {
                    if (dayInfo.shopClosures.length > 0) return <Store className="w-3 h-3 text-blue-400" />
                    if (!dayInfo.isWorkingDay) return <CalendarOff className="w-3 h-3 text-slate-400" />
                    if (dayInfo.barberAbsences.length > 0) {
                      if (dayInfo.availableBarbers === 0) return <X className="w-3 h-3 text-red-400" />
                      return <AlertCircle className="w-3 h-3 text-yellow-400" />
                    }
                    return <Check className="w-3 h-3 text-green-400" />
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
                            <div className="flex gap-1 mt-1">{getStatusIcon()}</div>
                          </motion.div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white p-3 max-w-xs">
                          <div className="space-y-1">
                            <p className="font-medium">{format(date, "EEEE, dd/MM/yyyy", { locale: ptBR })}</p>
                            
                            {dayInfo.shopClosures.length > 0 ? (
                              <>
                                <p className="text-blue-400">🏪 Barbearia fechada</p>
                                {dayInfo.shopClosures[0]?.reason && (
                                  <p className="text-xs text-slate-300">{dayInfo.shopClosures[0].reason}</p>
                                )}
                              </>
                            ) : !dayInfo.isWorkingDay ? (
                              <p className="text-slate-400">⏸️ Dia sem expediente</p>
                            ) : dayInfo.barberAbsences.length > 0 ? (
                              <>
                                {dayInfo.availableBarbers === 0 ? (
                                  <p className="text-red-400">❌ Nenhum barbeiro disponível</p>
                                ) : (
                                  <p className="text-yellow-400">
                                    ⚠️ {dayInfo.availableBarbers}/{dayInfo.totalBarbers} barbeiros
                                  </p>
                                )}
                                <p className="text-xs text-slate-300">
                                  {dayInfo.barberAbsences.length} ausência(s) registrada(s)
                                </p>
                              </>
                            ) : (
                              <p className="text-green-400">✅ Funcionamento normal</p>
                            )}
                            
                            {dayInfo.schedule && dayInfo.isWorkingDay && (
                              <p className="text-xs text-slate-400">
                                Expediente: {dayInfo.schedule.startTime} - {dayInfo.schedule.endTime}
                              </p>
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
                  <p className="text-sm text-slate-400">
                    {format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const dayInfo = getDayInfo(selectedDate, workSchedules, absences, barbers)
                    
                    // Fechamento da barbearia
                    if (dayInfo.shopClosures.length > 0) {
                      return (
                        <>
                          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                            <div className="flex items-center gap-2 text-blue-400 mb-2">
                              <Store className="w-5 h-5" />
                              <span className="font-medium">Barbearia Fechada</span>
                            </div>
                            {dayInfo.shopClosures[0]?.reason && (
                              <p className="text-sm text-slate-300">{dayInfo.shopClosures[0].reason}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                              {dayInfo.shopClosures[0]?.isAllDay ? 'Dia todo' : 'Período parcial'}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-[#8161FF]/20"
                              onClick={() => setSelectedDate(null)}
                            >
                              Fechar
                            </Button>
                            <Button 
                              variant="outline" 
                              className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500"
                            >
                              Remover Fechamento
                            </Button>
                          </div>
                        </>
                      )
                    }

                    // Dia sem expediente
                    if (!dayInfo.isWorkingDay) {
                      return (
                        <div className="p-4 rounded-lg bg-[#0c0c0c] border border-[#1f1f1f] text-center">
                          <CalendarOff className="w-8 h-8 text-slate-500 mx-auto mb-3" />
                          <p className="text-sm text-slate-300">Dia sem expediente</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {`Configure os horários na aba "Horários de Trabalho"`}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="mt-4 w-full bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500"
                            onClick={() => openAbsenceModalWithDate(selectedDate)}
                          >
                            <Store className="w-4 h-4 mr-2" />
                            Marcar Fechamento
                          </Button>
                        </div>
                      )
                    }

                    // Funcionamento com ausências
                    return (
                      <>
                        {/* Status do dia */}
                        <div className={`p-4 rounded-lg border ${
                          dayInfo.availableBarbers === 0 ? 'bg-red-500/10 border-red-500/30' :
                          dayInfo.barberAbsences.length > 0 ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-green-500/10 border-green-500/30'
                        }`}>
                          <div className="flex items-center gap-2 mb-2">
                            {dayInfo.availableBarbers === 0 ? 
                              <X className="w-5 h-5 text-red-400" /> :
                              dayInfo.barberAbsences.length > 0 ?
                              <AlertCircle className="w-5 h-5 text-yellow-400" /> :
                              <Check className="w-5 h-5 text-green-400" />
                            }
                            <span className={`font-medium ${
                              dayInfo.availableBarbers === 0 ? 'text-red-400' :
                              dayInfo.barberAbsences.length > 0 ? 'text-yellow-400' :
                              'text-green-400'
                            }`}>
                              {dayInfo.availableBarbers === 0 ? 'Nenhum barbeiro disponível' :
                               dayInfo.barberAbsences.length > 0 ? 'Funcionamento com ausências' :
                               'Funcionamento normal'}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {dayInfo.availableBarbers} de {dayInfo.totalBarbers} barbeiros disponíveis
                          </p>
                          {dayInfo.schedule && (
                            <p className="text-xs text-slate-400 mt-1">
                              Expediente: {dayInfo.schedule.startTime} às {dayInfo.schedule.endTime}
                            </p>
                          )}
                        </div>

                        {/* Lista de ausências */}
                        {dayInfo.barberAbsences.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-medium text-white flex items-center gap-2">
                              <UserX className="w-4 h-4" />
                              Ausências Registradas
                            </h4>
                            <div className="space-y-2">
                              {dayInfo.barberAbsences.map((absence) => (
                                <div 
                                  key={absence.id} 
                                  className="p-3 rounded-lg bg-red-500/10 border border-red-500/30"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-3 h-3 rounded-full bg-red-400" />
                                      <div>
                                        <p className="text-sm text-white">{absence.barberName}</p>
                                        {absence.reason && (
                                          <p className="text-xs text-slate-300">{absence.reason}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                                      {absence.isAllDay ? 'Dia todo' : 'Parcial'}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lista de barbeiros */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-white flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Barbeiros
                          </h4>
                          <div className="space-y-2">
                            {barbers.map((barber) => {
                              const barberInfo = getBarberInfo(barber, selectedDate, absences)
                              
                              return (
                                <div 
                                  key={barber.id} 
                                  className={`p-3 rounded-lg border flex items-center justify-between ${
                                    barberInfo.isAbsent ? 'bg-red-500/10 border-red-500/30' :
                                    !barberInfo.isAbsent ? 'bg-green-500/10 border-green-500/30' :
                                    'bg-[#0c0c0c] border-[#1f1f1f]'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${
                                      barberInfo.isAbsent ? 'bg-red-400' : 'bg-green-400'
                                    }`} />
                                    <div>
                                      <p className="text-sm text-white">{barber.name}</p>
                                      {barberInfo.absence?.reason && (
                                        <p className="text-xs text-red-300">{barberInfo.absence.reason}</p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-xs">
                                    {barberInfo.isAbsent ? (
                                      <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                                        Ausente
                                      </Badge>
                                    ) : (
                                      <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                                        Disponível
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Botões de ação */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-[#8161FF]/20"
                            onClick={() => setSelectedDate(null)}
                          >
                            Fechar
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-[#0c0c0c] border-[#1f1f1f] text-white hover:bg-red-500/20 hover:text-red-400 hover:border-red-500"
                            onClick={() => openAbsenceModalWithDate(selectedDate)}
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Ausência
                          </Button>
                        </div>
                      </>
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
                    Clique em um dia do calendário para ver detalhes dos barbeiros
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