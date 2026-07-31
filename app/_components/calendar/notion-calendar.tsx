'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  format,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  getHours,
  getMinutes,
  setHours,
  setMinutes,
  startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Scissors,
  X,
  Trash2,
  Save,
  Globe,
  Store,
  Loader2,
  PanelLeft,
} from 'lucide-react'
import { Button } from '../ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar as CalendarComponent } from '../ui/calendar'
import { cn } from '@/app/_lib/utils'
import { useShopSchedule, useBarberSchedule } from '@/app/_hooks/use-work-schedule'
import './notion-calendar.css'

// ─── Types ───
interface Appointment {
  id: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  serviceId: string
  serviceName: string
  barberId: string
  barberName: string
  date: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  source: 'PRESENCIAL' | 'ONLINE'
  notes?: string
  price: number
}

interface AppointmentModalData {
  id?: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  serviceId: string
  barberId: string
  date: Date
  status: Appointment['status']
  source: 'PRESENCIAL' | 'ONLINE'
  notes?: string
}

interface NotionCalendarProps {
  role: 'ADMIN' | 'BARBER'
  embedded?: boolean
  date?: Date
  barberId?: string
  onExit?: () => void
}

// ─── Constants ───
const HOURS = Array.from({ length: 12 }, (_, i) => i + 8) // 8h to 19h
const SLOT_HEIGHT = 48

const BARBER_COLORS = [
  { bg: 'rgba(129,97,255,0.85)', border: '#8161FF' },
  { bg: 'rgba(16,185,129,0.85)', border: '#10b981' },
  { bg: 'rgba(245,158,11,0.85)', border: '#f59e0b' },
  { bg: 'rgba(239,68,68,0.85)', border: '#ef4444' },
  { bg: 'rgba(59,130,246,0.85)', border: '#3b82f6' },
  { bg: 'rgba(236,72,153,0.85)', border: '#ec4899' },
]

const STATUS_LABELS: Record<Appointment['status'], string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  NO_SHOW: 'Não compareceu',
}

const STATUS_CONFIG: Record<Appointment['status'], { label: string; colorClass: string; dotColor: string }> = {
  PENDING: { label: 'Pendente', colorClass: 'notion-event-color-pending', dotColor: '#f59e0b' },
  CONFIRMED: { label: 'Confirmado', colorClass: 'notion-event-color-confirmed', dotColor: '#8161FF' },
  COMPLETED: { label: 'Concluído', colorClass: 'notion-event-color-completed', dotColor: '#10b981' },
  CANCELLED: { label: 'Cancelado', colorClass: 'notion-event-color-cancelled', dotColor: '#ef4444' },
  NO_SHOW: { label: 'Não compareceu', colorClass: 'notion-event-color-no_show', dotColor: '#6b7280' },
}

const isValidDate = (date: unknown): date is Date =>
  date instanceof Date && !isNaN(date.getTime())

// ─── Mini Calendar Component ───
function MiniCalendar({
  currentMonth,
  selectedDate,
  events,
  onSelectDate,
  onMonthChange,
  isOffDay,
}: {
  currentMonth: Date
  selectedDate: Date
  events: Appointment[]
  onSelectDate: (date: Date) => void
  onMonthChange: (date: Date) => void
  isOffDay: (date: Date) => boolean
}) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const calEnd = endOfWeek(monthEnd)
  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const eventDates = useMemo(
    () => events.map((e) => new Date(e.date)),
    [events]
  )

  return (
    <div className="notion-mini-calendar">
      <div className="notion-mini-header">
        <button
          className="notion-mini-title"
          onClick={() => onMonthChange(new Date())}
        >
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </button>
        <div className="notion-mini-nav">
          <button
            className="notion-mini-nav-btn"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            className="notion-mini-nav-btn"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="notion-mini-grid">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
          <div key={d} className="notion-mini-weekday">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const hasEvent = eventDates.some((ed) => isSameDay(ed, day))
          const isSelected = isSameDay(day, selectedDate)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          return (
            <button
              key={day.toISOString()}
              className={cn(
                'notion-mini-day',
                !isCurrentMonth && 'other-month',
                isToday(day) && 'today',
                isSelected && 'selected',
                hasEvent && 'has-event',
                isOffDay(day) && !isSelected && 'off-day'
              )}
              onClick={() => onSelectDate(day)}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Status Filter Component ───
function StatusFilters({
  statusFilter,
  onStatusChange,
  eventCounts,
}: {
  statusFilter: Appointment['status'] | 'all'
  onStatusChange: (s: Appointment['status'] | 'all') => void
  eventCounts: Record<string, number>
}) {
  const filters: { value: Appointment['status'] | 'all'; label: string; color: string }[] = [
    { value: 'all', label: 'Todos', color: '#888' },
    { value: 'PENDING', label: 'Pendente', color: '#f59e0b' },
    { value: 'CONFIRMED', label: 'Confirmado', color: '#8161FF' },
    { value: 'COMPLETED', label: 'Concluído', color: '#10b981' },
    { value: 'CANCELLED', label: 'Cancelado', color: '#ef4444' },
    { value: 'NO_SHOW', label: 'Faltou', color: '#6b7280' },
  ]

  return (
    <div className="notion-filters">
      <div className="notion-filter-title">Status</div>
      <div className="notion-filter-options">
        {filters.map((f) => (
          <button
            key={f.value}
            className={cn('notion-filter-btn', statusFilter === f.value && 'active')}
            onClick={() => onStatusChange(f.value)}
          >
            <span
              className="notion-filter-dot"
              style={{ backgroundColor: f.color }}
            />
            {f.label}
            {eventCounts[f.value] !== undefined && (
              <span className="notion-filter-count">{eventCounts[f.value]}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Event Card (for month view) ───
function MonthEvent({
  event,
  onClick,
  barberColor,
}: {
  event: Appointment
  onClick: () => void
  barberColor?: { bg: string; border: string }
}) {
  const time = format(new Date(event.date), 'HH:mm')
  const config = STATUS_CONFIG[event.status]
  const style = barberColor
    ? { background: barberColor.bg }
    : { background: config?.dotColor + '22' }
  return (
    <div
      className="notion-month-event"
      style={style}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      title={`${event.userName} - ${event.serviceName}${barberColor ? ` (${event.barberName})` : ''}`}
    >
      <span className="opacity-70">{time}</span>
      <span className="truncate">{event.userName}</span>
    </div>
  )
}

// ─── Time Grid Event ───
function TimeGridEvent({
  event,
  style,
  onClick,
  barberColor,
}: {
  event: Appointment
  style: React.CSSProperties
  onClick: () => void
  barberColor?: { bg: string; border: string }
}) {
  const time = format(new Date(event.date), 'HH:mm')
  const config = STATUS_CONFIG[event.status]
  const colorClass = barberColor ? 'notion-event-barber' : (config?.colorClass || 'notion-event-color-default')
  const barberStyle = barberColor
    ? { ...style, background: barberColor.bg + '22' }
    : style

  return (
    <div
      className={cn('notion-timegrid-event', colorClass)}
      style={barberStyle}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <div className="event-content">
        <div className="event-title">{event.userName}</div>
        <div className="event-subtitle">
          {time}
          {event.serviceName && ` · ${event.serviceName}`}
        </div>
      </div>
    </div>
  )
}

// ─── Details Panel ───
function EventDetailsPanel({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: Appointment | null
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  if (!event) return null

  const config = STATUS_CONFIG[event.status]

  return (
    <div className="notion-details-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
          Detalhes
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="space-y-4">
        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: config?.dotColor }}
          />
          <span className="text-sm font-medium text-white">
            {config?.label || event.status}
          </span>
          <Badge
            variant="outline"
            className="text-[10px] border-gray-700 text-gray-400"
          >
            {event.source === 'ONLINE' ? 'Online' : 'Presencial'}
          </Badge>
        </div>

        {/* Client */}
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Cliente
          </p>
          <p className="text-sm text-white font-medium flex items-center gap-2">
            <User size={14} className="text-gray-500" />
            {event.userName}
          </p>
          {event.userPhone && (
            <p className="text-xs text-gray-500 mt-0.5 ml-6">{event.userPhone}</p>
          )}
        </div>

        {/* Service */}
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Serviço
          </p>
          <p className="text-sm text-white flex items-center gap-2">
            <Scissors size={14} className="text-gray-500" />
            {event.serviceName}
          </p>
          {event.price > 0 && (
            <p className="text-xs text-green-400 mt-0.5 ml-6">
              R$ {event.price.toFixed(2)}
            </p>
          )}
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
            Data & Horário
          </p>
          <p className="text-sm text-white flex items-center gap-2">
            <CalendarIcon size={14} className="text-gray-500" />
            {format(new Date(event.date), "dd 'de' MMM", { locale: ptBR })}
          </p>
          <p className="text-xs text-gray-400 mt-0.5 ml-6 flex items-center gap-2">
            <Clock size={12} className="text-gray-500" />
            {format(new Date(event.date), "HH:mm 'às' HH:mm")}
          </p>
        </div>

        {/* Barber (if admin) */}
        {event.barberName && (
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
              Barbeiro
            </p>
            <p className="text-sm text-white">{event.barberName}</p>
          </div>
        )}

        {/* Notes */}
        {event.notes && (
          <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider mb-1">
              Observações
            </p>
            <p className="text-xs text-gray-400 bg-[#1A1A1A] rounded-lg p-3">
              {event.notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-[#2A2A2A]">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1 text-xs border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Save size={14} className="mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="flex-1 text-xs border-red-900/30 text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <Trash2 size={14} className="mr-1" />
            Excluir
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Current Time Hook ───
function useCurrentTime() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    // Update more frequently (every 30s) for a responsive time badge
    const interval = setInterval(() => {
      setNow(new Date())
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  return now
}

// ─── Main Calendar Component ───
export default function NotionCalendar({
  role,
  date,
  barberId,
  onExit,
}: NotionCalendarProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const now = useCurrentTime()
  const columnsRef = useRef<HTMLDivElement>(null)

  // ─── Work Schedule ───
  const { data: shopSchedule } = useShopSchedule()
  const barberIdForSchedule = role === 'BARBER' ? (session?.user?.barberId || barberId || null) : null
  const { data: barberSchedule } = useBarberSchedule(barberIdForSchedule)

  // Active days of week (0=Sun … 6=Sat) that have work
  const workingDays = useMemo<Set<number>>(() => {
    const schedule = role === 'BARBER' ? (barberSchedule ?? shopSchedule) : shopSchedule
    if (!schedule) return new Set([0,1,2,3,4,5,6])
    return new Set(schedule.filter((s) => s.isActive).map((s) => s.dayOfWeek))
  }, [role, shopSchedule, barberSchedule])

  const isOffDay = useCallback((date: Date) => !workingDays.has(date.getDay()), [workingDays])

  // State
  const [currentDate, setCurrentDate] = useState(date || new Date())
  const [selectedDate, setSelectedDate] = useState(date || new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [statusFilter, setStatusFilter] = useState<Appointment['status'] | 'all'>('all')
  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [dateRange, setDateRange] = useState({ start: new Date(), end: new Date() })
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const monthScrollRef = useRef<HTMLDivElement>(null)
  const monthSectionRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [visibleMonth, setVisibleMonth] = useState<Date | null>(null)
  // Infinite month scroll: offset range rendered around selectedDate
  const [monthOffsets, setMonthOffsets] = useState<number[]>(() =>
    Array.from({ length: 13 }, (_, i) => i - 6)
  )
  const isExpandingRef = useRef(false)

  const defaultFormData = useCallback(
    (): AppointmentModalData => ({
      userId: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      serviceId: '',
      barberId: role === 'BARBER' ? session?.user?.barberId || barberId || '' : barberId || '',
      date: selectedDate,
      status: 'PENDING',
      source: role === 'BARBER' ? 'PRESENCIAL' : 'ONLINE',
      notes: '',
    }),
    [role, session?.user?.barberId, barberId, selectedDate]
  )

  const [formData, setFormData] = useState<AppointmentModalData>(defaultFormData)

  // Update date range based on view (month view uses a fixed wide range, not monthOffsets)
  useEffect(() => {
    let start: Date, end: Date
    if (viewMode === 'day') {
      start = startOfDay(selectedDate)
      end = addDays(start, 1)
    } else if (viewMode === 'week') {
      start = startOfWeek(selectedDate, { weekStartsOn: 0 })
      end = endOfWeek(selectedDate, { weekStartsOn: 0 })
    } else {
      // Fixed 2-year window centered on selectedDate — never changes on scroll
      start = startOfMonth(addMonths(selectedDate, -12))
      end = endOfMonth(addMonths(selectedDate, 12))
    }
    start = addDays(start, -1)
    end = addDays(end, 1)
    setDateRange({ start, end })
  }, [selectedDate, viewMode])

  // Reset form when modal opens
  useEffect(() => {
    if (modalOpen && modalMode === 'create') {
      setFormData({ ...defaultFormData(), date: selectedDate })
    }
  }, [modalOpen, modalMode, defaultFormData, selectedDate])

  // ─── Data Fetching ───
  const { data: calendarData, isLoading } = useQuery<{ events: any[] }>({
    queryKey: ['calendar-appointments', dateRange, role],
    queryFn: async () => {
      const response = await fetch(
        `/api/appointments/calendar?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      )
      if (!response.ok) throw new Error('Erro ao carregar agendamentos')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: services } = useQuery<{ id: string; name: string; price: number }[]>({
    queryKey: ['barbershop-services'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/services')
      if (!response.ok) throw new Error('Erro ao carregar serviços')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: barbers } = useQuery<{ id: string; name: string }[]>({
    queryKey: ['barbershop-barbers'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/barbers')
      if (!response.ok) throw new Error('Erro ao carregar barbeiros')
      return response.json()
    },
    enabled: role === 'ADMIN' && !!session,
  })

  // ─── Process Events ───
  const allEvents: Appointment[] = useMemo(() => {
    if (!calendarData?.events) return []
    return calendarData.events.map((e: any) => ({
      id: String(e.id || ''),
      userId: String(e.user?.id || e.userId || ''),
      userName: String(e.user?.name || e.title?.split(' - ')[0] || 'Cliente'),
      userEmail: String(e.user?.email || ''),
      userPhone: String(e.user?.phone || ''),
      serviceId: String(e.service?.id || e.serviceId || ''),
      serviceName: String(e.service?.name || e.title?.split(' - ')[1] || 'Serviço'),
      barberId: String(e.barber?.id || e.barberId || ''),
      barberName: String(e.barber?.name || ''),
      date: String(typeof e.date === 'string' ? e.date : e.start || e.date),
      status: (String(e.status || 'PENDING').toUpperCase()) as Appointment['status'],
      source: String(e.source || 'PRESENCIAL') as 'PRESENCIAL' | 'ONLINE',
      notes: String(e.notes || ''),
      price: Number(e.service?.price || e.price || 0),
    }))
  }, [calendarData])

  // Map barber IDs to color indices (stable per session)
  const barberColorMap = useMemo(() => {
    const map: Record<string, number> = {}
    let idx = 0
    for (const e of allEvents) {
      if (e.barberId && !(e.barberId in map)) {
        map[e.barberId] = idx % BARBER_COLORS.length
        idx++
      }
    }
    return map
  }, [allEvents])

  const getBarberColor = useCallback(
    (barberId: string) => BARBER_COLORS[barberColorMap[barberId] ?? 0],
    [barberColorMap]
  )

  const filteredEvents = useMemo(() => {
    let events = statusFilter === 'all' ? allEvents : allEvents.filter((e) => e.status === statusFilter)
    if (role === 'ADMIN' && selectedBarberId !== 'all') {
      events = events.filter((e) => e.barberId === selectedBarberId)
    }
    return events
  }, [allEvents, statusFilter, selectedBarberId, role])

  const eventsForDate = useCallback(
    (date: Date) =>
      filteredEvents.filter((e) => isSameDay(new Date(e.date), date)),
    [filteredEvents]
  )

  const eventCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allEvents.length }
    for (const status of Object.keys(STATUS_LABELS)) {
      counts[status] = allEvents.filter((e) => e.status === status).length
    }
    return counts
  }, [allEvents])

  // ─── Mutations ───
  const invalidateCalendar = () =>
    queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] })

  const closeAndReset = () => {
    setModalOpen(false)
    setFormData(defaultFormData())
    setModalMode('create')
  }

  const createMutation = useMutation({
    mutationFn: async (data: unknown) => {
      const response = await fetch('/api/appointments/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error('Erro ao criar agendamento')
      return response.json()
    },
    onSuccess: () => {
      invalidateCalendar()
      toast.success('Agendamento criado com sucesso!')
      closeAndReset()
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao criar agendamento'),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: unknown }) => {
      const response = await fetch(`/api/appointments/calendar/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || 'Erro ao atualizar agendamento')
      }
      return response.json()
    },
    onSuccess: () => {
      invalidateCalendar()
      toast.success('Agendamento atualizado com sucesso!')
      closeAndReset()
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao atualizar agendamento'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/appointments/calendar/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao excluir agendamento')
    },
    onSuccess: () => {
      invalidateCalendar()
      toast.success('Agendamento excluído com sucesso!')
      setSelectedEvent(null)
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao excluir agendamento'),
  })

  // ─── Handlers ───
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setCurrentDate(date)
    setSelectedEvent(null)
    if (viewMode === 'month') {
      monthViewInitRef.current = false
      setMonthOffsets(Array.from({ length: 13 }, (_, i) => i - 6))
    }
  }

  const handleNavigate = (direction: 'prev' | 'next') => {
    const fn = viewMode === 'day'
      ? (d: Date) => direction === 'prev' ? subDays(d, 1) : addDays(d, 1)
      : viewMode === 'week'
      ? (d: Date) => direction === 'prev' ? subWeeks(d, 1) : addWeeks(d, 1)
      : (d: Date) => direction === 'prev' ? subMonths(d, 1) : addMonths(d, 1)
    const newDate = fn(selectedDate)
    setSelectedDate(newDate)
    setCurrentDate(newDate)
  }

  const handleGoToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentDate(today)
    if (viewMode === 'month') {
      monthViewInitRef.current = false
      setMonthOffsets(Array.from({ length: 13 }, (_, i) => i - 6))
    }
  }

  const handleSlotClick = (date: Date) => {
    setFormData({ ...defaultFormData(), date })
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEventClick = (event: Appointment) => {
    setSelectedEvent(event)
  }

  const handleEditEvent = () => {
    if (!selectedEvent) return
    setFormData({
      id: selectedEvent.id,
      userId: selectedEvent.userId,
      userName: selectedEvent.userName,
      userEmail: selectedEvent.userEmail,
      userPhone: selectedEvent.userPhone,
      serviceId: selectedEvent.serviceId,
      barberId: selectedEvent.barberId,
      date: new Date(selectedEvent.date),
      status: selectedEvent.status,
      source: selectedEvent.source,
      notes: selectedEvent.notes || '',
    })
    setModalMode('edit')
    setModalOpen(true)
  }

  const handleDeleteEvent = () => {
    if (!selectedEvent) return
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      deleteMutation.mutate(selectedEvent.id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      barberId:
        role === 'BARBER'
          ? session?.user?.barberId || barberId
          : formData.barberId,
      date: formData.date.toISOString(),
    }

    if (modalMode === 'edit' && formData.id) {
      updateMutation.mutate({ id: formData.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  // Get week number
  const getWeekNumber = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 0 })
    const weekNum = Math.ceil((weekStart.getTime() - new Date(weekStart.getFullYear(), 0, 1).getTime()) / 604800000)
    return `Week ${weekNum}`
  }

  // Calculate current time position in pixels from top of grid
  const getCurrentTimePosition = useCallback(() => {
    const hours = getHours(now)
    const minutes = getMinutes(now)
    const firstHour = HOURS[0]
    const minutesFromStart = (hours - firstHour) * 60 + minutes
    return (minutesFromStart / 60) * SLOT_HEIGHT
  }, [now])

  // ─── Month IntersectionObserver: track visible month + expand on edges ───
  useEffect(() => {
    if (viewMode !== 'month') return
    const root = monthScrollRef.current
    if (!root) return

    const observer = new IntersectionObserver(
      (entries) => {
        // Update toolbar title
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible.length > 0) {
          const key = (visible[0].target as HTMLElement).dataset.monthKey
          if (key) setVisibleMonth(new Date(key))
        }

        // Expand when near top or bottom edge
        if (isExpandingRef.current) return
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          const offset = Number(el.dataset.monthOffset)
          if (offset === monthOffsets[0]) {
            // Near top — prepend 3 months
            isExpandingRef.current = true
            const prevScrollHeight = root.scrollHeight
            const prevScrollTop = root.scrollTop
            setMonthOffsets((prev) => [
              prev[0] - 3, prev[0] - 2, prev[0] - 1, ...prev,
            ])
            // Restore scroll position after DOM update
            requestAnimationFrame(() => {
              root.scrollTop = prevScrollTop + (root.scrollHeight - prevScrollHeight)
              isExpandingRef.current = false
            })
          } else if (offset === monthOffsets[monthOffsets.length - 1]) {
            // Near bottom — append 3 months
            isExpandingRef.current = true
            setMonthOffsets((prev) => [
              ...prev, prev[prev.length - 1] + 1, prev[prev.length - 1] + 2, prev[prev.length - 1] + 3,
            ])
            requestAnimationFrame(() => { isExpandingRef.current = false })
          }
        }
      },
      { root, threshold: 0.1 }
    )

    monthSectionRefs.current.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [viewMode, monthOffsets])

  // Scroll to current month when entering month view
  const monthViewInitRef = useRef(false)
  useEffect(() => {
    if (viewMode !== 'month') {
      monthViewInitRef.current = false
      return
    }
    if (monthViewInitRef.current) return

    const root = monthScrollRef.current
    if (!root) return

    monthViewInitRef.current = true

    const scrollToOffset0 = () => {
      const el = root.querySelector('[data-month-offset="0"]') as HTMLElement | null
      if (el) {
        root.scrollTop = el.offsetTop
        return true
      }
      return false
    }

    // Try immediately; if DOM not ready yet, retry with rAF
    if (!scrollToOffset0()) {
      const raf = requestAnimationFrame(() => {
        scrollToOffset0()
      })
      return () => cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, monthOffsets])

  // ─── Month View (infinite scroll) ───
  const renderMonthView = () => {
    const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

    return (
      <>
        {monthOffsets.map((offset) => {
          const month = addMonths(selectedDate, offset)
          const monthKey = startOfMonth(month).toISOString()
          const calStart = startOfWeek(startOfMonth(month))
          const calEnd = endOfWeek(endOfMonth(month))
          const days = eachDayOfInterval({ start: calStart, end: calEnd })

          return (
            <div
              key={monthKey}
              className="notion-month-section"
              data-month-key={monthKey}
              data-month-offset={offset}
              ref={(el) => {
                if (el) monthSectionRefs.current.set(monthKey, el)
                else monthSectionRefs.current.delete(monthKey)
              }}
            >
              <div className="notion-month-label">
                {format(month, "MMMM 'de' yyyy", { locale: ptBR })}
              </div>
              <div className="notion-monthgrid">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="notion-monthgrid-weekday">{d}</div>
                ))}
                {days.map((day) => {
                  const dayEvents = eventsForDate(day)
                  const inMonth = isSameMonth(day, month)
                  return (
                    <div
                      key={day.toISOString()}
                      className={cn(
                        'notion-monthgrid-day',
                        !inMonth && 'other-month',
                        isToday(day) && 'today',
                        isOffDay(day) && !isToday(day) && 'off-day'
                      )}
                      onClick={() => { setSelectedDate(day); setCurrentDate(day) }}
                      onDoubleClick={() => handleSlotClick(day)}
                    >
                      <div className="notion-monthgrid-day-number">
                        {format(day, 'd')}
                      </div>
                      <div className="notion-monthgrid-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <MonthEvent
                            key={event.id}
                            event={event}
                            barberColor={role === 'ADMIN' && selectedBarberId === 'all' ? getBarberColor(event.barberId) : undefined}
                            onClick={() => handleEventClick(event)}
                          />
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="text-[10px] text-gray-500 px-1">
                            +{dayEvents.length - 3} mais
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </>
    )
  }

  // ─── Scroll offset tracking for badge positioning in the gutter ───
  const [scrollOffset, setScrollOffset] = useState(0)

  useEffect(() => {
    const el = columnsRef.current
    if (!el) return
    const handler = () => {
      setScrollOffset(el.scrollTop)
    }
    // Use passive listener for performance
    el.addEventListener('scroll', handler, { passive: true })
    // Initial value
    setScrollOffset(el.scrollTop)
    return () => el.removeEventListener('scroll', handler)
  }, [viewMode])

  // ─── Week View ───
  const renderWeekView = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
    const currentTimePos = getCurrentTimePosition()
    const todayIndex = days.findIndex((d) => isToday(d))
    const timePosPx = currentTimePos
    return (
      <div className="notion-timegrid">
        {/* Header */}
        <div className="notion-timegrid-header">
          <div className="notion-timegrid-gutter" />
          <div className="notion-timegrid-header-scroll">
            <div
              className="notion-timegrid-header-track"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'notion-timegrid-header-cell',
                    isToday(day) && 'today',
                    isOffDay(day) && 'off-day'
                  )}
                >
                  <span className="day-name">
                    {format(day, 'EEE', { locale: ptBR })}
                  </span>
                  <span className="day-number">{format(day, 'd')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="notion-timegrid-body">
          <div className="notion-timegrid-labels">
            {HOURS.map((hour) => (
              <div key={hour} className="notion-timegrid-label">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
            {/* Badge in the gutter - follows the red line */}
            <div
              className="notion-current-time-badge"
              style={{ top: `${timePosPx - scrollOffset}px` }}
            >
              {format(now, 'HH:mm')}
            </div>
          </div>

          <div className="notion-timegrid-columns-scroll" ref={columnsRef}>
            <div
              className="notion-timegrid-columns"
              style={{ gridTemplateColumns: `repeat(${days.length}, 1fr)` }}
            >
              {days.map((day) => {
                const dayEvents = eventsForDate(day)
                return (
                  <div key={day.toISOString()} className={cn('notion-timegrid-column', isOffDay(day) && 'off-day')}>
                    {HOURS.map((hour) => (
                      <div
                        key={`${day.toISOString()}-${hour}`}
                        className="notion-timegrid-slot"
                        onClick={() => {
                          const slotDate = setHours(setMinutes(day, 0), hour)
                          handleSlotClick(slotDate)
                        }}
                      />
                    ))}
                    {dayEvents.map((event) => {
                      const eventDate = new Date(event.date)
                      const hour = getHours(eventDate)
                      const minutes = getMinutes(eventDate)
                      const slotIndex = HOURS.indexOf(hour)
                      if (slotIndex === -1) return null

                      const top = slotIndex * SLOT_HEIGHT + (minutes / 60) * SLOT_HEIGHT
                      const height = 28 // compact height
                      return (
                        <TimeGridEvent
                          key={event.id}
                          event={event}
                          barberColor={role === 'ADMIN' && selectedBarberId === 'all' ? getBarberColor(event.barberId) : undefined}
                          style={{
                            top: `${top}px`,
                            height: `${height}px`,
                          }}
                          onClick={() => handleEventClick(event)}
                        />
                      )
                    })}
                  </div>
                )
              })}

              {/* Current time line - subtle across all columns, strong on today's column */}
              <div
                className="notion-current-time-week"
                style={{ top: `${currentTimePos}px` }}
              >
                <div className="notion-current-time-line" />
                {todayIndex >= 0 && (
                  <div
                    className="notion-current-time-strong"
                    style={{
                      left: `${(todayIndex / days.length) * 100}%`,
                      width: `${100 / days.length}%`,
                    }}
                  />
                )}
                {todayIndex >= 0 && (
                  <div
                    className="notion-current-time-tick"
                    style={{ left: `${(todayIndex / days.length) * 100}%` }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Day View ───
  const renderDayView = () => {
    const dayEvents = eventsForDate(selectedDate)
    const currentTimePos = getCurrentTimePosition()
    const timePosPx = currentTimePos

    return (
      <div className="notion-timegrid">
        {/* Header */}
        <div className="notion-timegrid-header">
          <div className="notion-timegrid-gutter" />
          <div className="notion-timegrid-header-scroll">
            <div
              className="notion-timegrid-header-track"
              style={{ gridTemplateColumns: '1fr' }}
            >
              <div
                className={cn(
                  'notion-timegrid-header-cell',
                  isToday(selectedDate) && 'today'
                )}
              >
                <span className="day-name">
                  {format(selectedDate, 'EEEE', { locale: ptBR })}
                </span>
                <span className="day-number">
                  {format(selectedDate, 'd')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="notion-timegrid-body">
          <div className="notion-timegrid-labels">
            {HOURS.map((hour) => (
              <div key={hour} className="notion-timegrid-label">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
            {/* Badge in the gutter - follows the red line */}
            <div
              className="notion-current-time-badge"
              style={{ top: `${timePosPx - scrollOffset}px` }}
            >
              {format(now, 'HH:mm')}
            </div>
          </div>

          <div className="notion-timegrid-columns-scroll" ref={columnsRef}>
            <div
              className="notion-timegrid-columns"
              style={{ gridTemplateColumns: '1fr' }}
            >
              <div className="notion-timegrid-column">
                {HOURS.map((hour) => (
                  <div
                    key={`${selectedDate.toISOString()}-${hour}`}
                    className="notion-timegrid-slot"
                    onClick={() => {
                      const slotDate = setHours(setMinutes(selectedDate, 0), hour)
                      handleSlotClick(slotDate)
                    }}
                  />
                ))}
                {dayEvents.map((event) => {
                  const eventDate = new Date(event.date)
                  const hour = getHours(eventDate)
                  const minutes = getMinutes(eventDate)
                  const slotIndex = HOURS.indexOf(hour)
                  if (slotIndex === -1) return null

                  const top = slotIndex * SLOT_HEIGHT + (minutes / 60) * SLOT_HEIGHT
                  return (
                    <TimeGridEvent
                      key={event.id}
                      event={event}
                      barberColor={role === 'ADMIN' && selectedBarberId === 'all' ? getBarberColor(event.barberId) : undefined}
                      style={{
                        top: `${top}px`,
                        height: `${Math.max(28, 28)}px`,
                      }}
                      onClick={() => handleEventClick(event)}
                    />
                  )
                })}

                {/* Current time indicator */}
                <div
                  className="notion-current-time"
                  style={{ top: `${currentTimePos}px` }}
                >
                  <div className="notion-current-time-dot" />
                  <div className="notion-current-time-line" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Create Button ───
  const handleCreateNew = () => {
    setFormData({ ...defaultFormData(), date: selectedDate })
    setModalMode('create')
    setModalOpen(true)
  }

  // Get month and year for toolbar
  const displayDate = viewMode === 'month' && visibleMonth ? visibleMonth : selectedDate
  const monthName = format(displayDate, 'MMMM', { locale: ptBR })
  const yearName = format(displayDate, 'yyyy')
  const weekLabel = viewMode === 'week' ? getWeekNumber(selectedDate) : ''

  return (
    <div className="notion-calendar h-full flex flex-col">
      {/* ─── Toolbar ─── */}
      <div className="notion-toolbar">
        <div className="notion-toolbar-left">
          {onExit && (
            <button
              className="notion-nav-btn"
              onClick={onExit}
              title="Voltar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          <button
            className="notion-nav-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Fechar sidebar' : 'Abrir sidebar'}
          >
            <PanelLeft size={18} />
          </button>

          <div className="notion-toolbar-title">
            <span className="notion-toolbar-month">{monthName}</span>
            <span className="notion-toolbar-year">{yearName}</span>
            {weekLabel && <span className="notion-toolbar-week">{weekLabel}</span>}
          </div>
        </div>

        <div className="notion-toolbar-right">
          <div className="notion-view-toggle">
            <button
              className={cn('notion-view-btn', viewMode === 'day' && 'active')}
              onClick={() => setViewMode('day')}
            >
              Dia
            </button>
            <button
              className={cn('notion-view-btn', viewMode === 'week' && 'active')}
              onClick={() => setViewMode('week')}
            >
              Semana
            </button>
            <button
              className={cn('notion-view-btn', viewMode === 'month' && 'active')}
              onClick={() => setViewMode('month')}
            >
              Mês
            </button>
          </div>

          <button className="notion-today-btn" onClick={handleGoToToday}>
            Hoje
          </button>

          <button className="notion-nav-btn" onClick={() => handleNavigate('prev')}>
            <ChevronLeft size={18} />
          </button>
          <button className="notion-nav-btn" onClick={() => handleNavigate('next')}>
            <ChevronRight size={18} />
          </button>

          <div className="notion-avatar" title="Admin">
            {session?.user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </div>
      </div>

      {/* ─── Main Layout ─── */}
      <div className="notion-layout flex-1 min-h-0">
        {/* ─── Sidebar ─── */}
        {sidebarOpen && (
          <div className="notion-sidebar">
            <MiniCalendar
              currentMonth={currentDate}
              selectedDate={selectedDate}
              events={allEvents}
              onSelectDate={handleDateSelect}
              onMonthChange={setCurrentDate}
              isOffDay={isOffDay}
            />

            <div className="notion-sidebar-divider" />

            {/* Barber filter - ADMIN only */}
            {role === 'ADMIN' && barbers && barbers.length > 0 && (
              <div className="notion-filters">
                <div className="notion-filter-title">Barbeiro</div>
                <div className="notion-filter-options">
                  <button
                    className={cn('notion-filter-btn', selectedBarberId === 'all' && 'active')}
                    onClick={() => setSelectedBarberId('all')}
                  >
                    <span className="notion-filter-dot" style={{ backgroundColor: '#888' }} />
                    Todos
                    <span className="notion-filter-count">{allEvents.length}</span>
                  </button>
                  {barbers.map((barber) => {
                    const color = getBarberColor(barber.id)
                    const count = allEvents.filter((e) => e.barberId === barber.id).length
                    return (
                      <button
                        key={barber.id}
                        className={cn('notion-filter-btn', selectedBarberId === barber.id && 'active')}
                        onClick={() => setSelectedBarberId(barber.id)}
                      >
                        <span className="notion-filter-dot" style={{ backgroundColor: color.border }} />
                        {barber.name}
                        <span className="notion-filter-count">{count}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <StatusFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              eventCounts={eventCounts}
            />

            <div className="notion-sidebar-divider" />

            <button
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#8161FF] hover:bg-[#6a4dff] text-white text-sm font-medium transition-colors w-full"
            >
              <Plus size={16} />
              Novo Agendamento
            </button>
          </div>
        )}

        {/* ─── Main Calendar Area ─── */}
        <div className="notion-main">
          {/* Events Area */}
          <div className="notion-events-area">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : (
              <>
                {viewMode === 'day' && renderDayView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'month' && (
                  <div className="notion-month-scroll" ref={monthScrollRef}>
                    {renderMonthView()}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ─── Details Panel ─── */}
        {selectedEvent && (
          <EventDetailsPanel
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
          />
        )}
      </div>

      {/* ─── Create/Edit Modal ─── */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          if (!open) closeAndReset()
          else setModalOpen(true)
        }}
      >
        <DialogContent className="sm:max-w-[600px] bg-[#0c0c0c] border-[#1f1f1f] text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {modalMode === 'edit' ? 'Editar Agendamento' : 'Novo Agendamento'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </Label>
              <Input
                placeholder="Nome do cliente"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                required
                disabled={modalMode === 'edit'}
              />
              <Input
                placeholder="Email (opcional)"
                type="email"
                value={formData.userEmail}
                onChange={(e) =>
                  setFormData({ ...formData, userEmail: e.target.value })
                }
                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                disabled={modalMode === 'edit'}
              />
              <Input
                placeholder="Telefone (opcional)"
                value={formData.userPhone}
                onChange={(e) =>
                  setFormData({ ...formData, userPhone: e.target.value })
                }
                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                disabled={modalMode === 'edit'}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Serviço
              </Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) =>
                  setFormData({ ...formData, serviceId: value })
                }
                required
              >
                <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  {services?.map(
                    (service: { id: string; name: string; price: number }) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} - R$ {Number(service.price).toFixed(2)}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            {role === 'ADMIN' && (
              <div className="space-y-2">
                <Label className="text-white">Barbeiro</Label>
                <Select
                  value={formData.barberId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, barberId: value })
                  }
                  required
                >
                  <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    <SelectValue placeholder="Selecione um barbeiro" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    {barbers?.map((barber: { id: string; name: string }) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  Data
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-[#0f0f0f] border-[#1f1f1f] text-white justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {isValidDate(formData.date)
                        ? format(formData.date, "dd 'de' MMM yyyy", {
                            locale: ptBR,
                          })
                        : 'Selecione uma data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0c0c0c] border-[#1f1f1f]">
                    <CalendarComponent
                      mode="single"
                      selected={formData.date}
                      onSelect={(d) =>
                        d && setFormData({ ...formData, date: d })
                      }
                      locale={ptBR}
                      disabled={{ before: new Date() }}
                      className="bg-[#0c0c0c] text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Hora
                </Label>
                <Input
                  type="time"
                  value={
                    isValidDate(formData.date)
                      ? format(formData.date, 'HH:mm')
                      : '09:00'
                  }
                  onChange={(e) => {
                    if (!isValidDate(formData.date)) return
                    const [hours, minutes] = e.target.value.split(':')
                    const newDate = new Date(formData.date)
                    newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)
                    setFormData({ ...formData, date: newDate })
                  }}
                  className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    status: value as Appointment['status'],
                  })
                }
              >
                <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  {(Object.keys(STATUS_LABELS) as Appointment['status'][]).map(
                    (s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-white flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Origem do Agendamento
              </Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    source: value as Appointment['source'],
                  })
                }
                disabled={role === 'BARBER'}
              >
                <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                  <SelectItem value="PRESENCIAL">
                    <div className="flex items-center gap-2">
                      <Store className="w-3 h-3" />
                      Presencial
                    </div>
                  </SelectItem>
                  <SelectItem value="ONLINE">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3" />
                      Online
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {role === 'BARBER' && (
                <p className="text-xs text-slate-400">
                  Os barbeiros só podem criar agendamentos presenciais
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-white">Observações</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                rows={3}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-[#1f1f1f]">
              <div className="flex items-center gap-2">
                <Badge
                  className={cn(
                    'text-white',
                    formData.status === 'PENDING'
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : formData.status === 'CONFIRMED'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : formData.status === 'COMPLETED'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : formData.status === 'CANCELLED'
                      ? 'bg-red-500/20 text-red-400 border-red-500/30'
                      : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  )}
                >
                  {STATUS_LABELS[formData.status]}
                </Badge>
                {formData.source && (
                  <Badge variant="outline" className="text-xs">
                    {formData.source === 'PRESENCIAL'
                      ? 'Presencial'
                      : 'Online'}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {modalMode === 'edit' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (formData.id) {
                        if (
                          confirm(
                            'Tem certeza que deseja excluir este agendamento?'
                          )
                        ) {
                          deleteMutation.mutate(formData.id)
                        }
                      }
                    }}
                    className="text-red-400 border-red-500/30 hover:bg-red-500/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeAndReset}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#8161FF] hover:bg-[#6a4dff]"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {modalMode === 'edit' ? 'Salvar' : 'Criar'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}