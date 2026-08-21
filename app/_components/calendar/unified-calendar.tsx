'use client'

import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import ptBrLocale from '@fullcalendar/core/locales/pt-br'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
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
import {
  Calendar,
  Clock,
  Scissors,
  User,
  X,
  Save,
  Trash2,
  Globe,
  Store,
} from 'lucide-react'
import { Badge } from '../ui/badge'
import { Textarea } from '../ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Calendar as CalendarComponent } from '../ui/calendar'
import { cn } from '@/app/_lib/utils'
import './calendar-modern.css'

interface AppointmentModalData {
  id?: string
  userId: string
  userName: string
  userEmail: string
  userPhone: string
  serviceId: string
  barberId: string
  date: Date
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  source: 'PRESENCIAL' | 'ONLINE'
  notes?: string
}

interface UnifiedCalendarProps {
  role: 'ADMIN' | 'BARBER'
  embedded?: boolean
  date?: Date
}

const isValidDate = (date: unknown): date is Date =>
  date instanceof Date && !isNaN(date.getTime())

const STATUS_LABELS: Record<AppointmentModalData['status'], string> = {
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
}

const STATUS_STYLES: Record<AppointmentModalData['status'], string> = {
  CONFIRMED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  COMPLETED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
}

export default function UnifiedCalendar({
  role,
  embedded = false,
  date,
}: UnifiedCalendarProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<{
    id: string
  } | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [dateRange, setDateRange] = useState({
    start: new Date(),
    end: new Date(),
  })

  const defaultFormData = useCallback(
    (): AppointmentModalData => ({
      userId: '',
      userName: '',
      userEmail: '',
      userPhone: '',
      serviceId: '',
      barberId: role === 'BARBER' ? session?.user?.barberId || '' : '',
      date: date || new Date(),
      status: 'CONFIRMED',
      source: role === 'BARBER' ? 'PRESENCIAL' : 'ONLINE',
      notes: '',
    }),
    [role, session?.user?.barberId, date]
  )

  const [formData, setFormData] =
    useState<AppointmentModalData>(defaultFormData)

  const { data: calendarData } = useQuery({
    queryKey: ['calendar-appointments', dateRange],
    queryFn: async () => {
      const response = await fetch(
        `/api/appointments/calendar?start=${dateRange.start.toISOString()}&end=${dateRange.end.toISOString()}`
      )
      if (!response.ok) throw new Error('Erro ao carregar agendamentos')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: services } = useQuery({
    queryKey: ['barbershop-services'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/services')
      if (!response.ok) throw new Error('Erro ao carregar serviços')
      return response.json()
    },
    enabled: !!session,
  })

  const { data: barbers } = useQuery({
    queryKey: ['barbershop-barbers'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/barbers')
      if (!response.ok) throw new Error('Erro ao carregar barbeiros')
      return response.json()
    },
    enabled: role === 'ADMIN' && !!session,
  })

  const invalidateCalendar = () =>
    queryClient.invalidateQueries({ queryKey: ['calendar-appointments'] })

  const closeAndReset = () => {
    setModalOpen(false)
    setFormData(defaultFormData())
    setSelectedAppointment(null)
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
    },
    onError: (error: Error) =>
      toast.error(error.message || 'Erro ao excluir agendamento'),
  })

  const handleDateClick = (arg: { date: Date | string }) => {
    const clickedDate = arg.date instanceof Date ? arg.date : new Date(arg.date)
    setFormData({ ...defaultFormData(), date: clickedDate })
    setModalMode('create')
    setModalOpen(true)
  }

  const handleEventClick = (clickInfo: { event: { extendedProps: any } }) => {
    const appointment = clickInfo.event.extendedProps
    if (!appointment) return

    const appointmentDate = new Date(appointment.date)
    if (!isValidDate(appointmentDate)) {
      toast.error('Data do agendamento inválida')
      return
    }

    setSelectedAppointment({ id: appointment.id })
    setModalMode('edit')
    setFormData({
      id: appointment.id,
      userId: appointment.user.id,
      userName: appointment.user.name,
      userEmail: appointment.user.email,
      userPhone: appointment.user.phone,
      serviceId: appointment.service.id,
      barberId: appointment.barber?.id || '',
      date: appointmentDate,
      status: appointment.status.toUpperCase(),
      source: appointment.source,
      notes: appointment.notes || '',
    })
    setModalOpen(true)
  }

  const handleEventDrop = (dropInfo: {
    event: { extendedProps: any; start: Date | null }
  }) => {
    const { extendedProps: appointment, start: newDate } = dropInfo.event
    if (!appointment || !newDate) return

    updateMutation.mutate({
      id: appointment.id,
      data: {
        userId: appointment.user.id,
        serviceId: appointment.service.id,
        barberId: appointment.barber?.id,
        date: newDate.toISOString(),
        status: appointment.status.toUpperCase(),
        source: appointment.source,
        notes: appointment.notes || '',
      },
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      ...formData,
      barberId: role === 'BARBER' ? session?.user?.barberId : formData.barberId,
      date: formData.date.toISOString(),
    }

    if (modalMode === 'edit' && selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleDelete = () => {
    if (selectedAppointment) {
      deleteMutation.mutate(selectedAppointment.id)
      setModalOpen(false)
    }
  }

  return (
    <>
      {!embedded && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">
            {role === 'BARBER' ? 'Minha Agenda' : 'Agenda da Barbearia'}
          </h1>
          <p className="text-gray-400 mt-1">
            {role === 'BARBER'
              ? 'Gerencie seus agendamentos diários'
              : 'Gerencie todos os agendamentos dos seus barbeiros'}
          </p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
        <div className="flex-1 bg-[#151515] rounded-xl border border-[#2A2A2A] overflow-hidden">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarData?.events || []}
            locale={ptBrLocale}
            selectable
            editable
            eventDrop={handleEventDrop}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            height="100%"
            allDaySlot={false}
            buttonText={{
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
            }}
            datesSet={(dateInfo) =>
              setDateRange({ start: dateInfo.start, end: dateInfo.end })
            }
          />
        </div>

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
                {modalMode === 'edit'
                  ? 'Editar Agendamento'
                  : 'Novo Agendamento'}
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
                      (service: {
                        id: string
                        name: string
                        price: number
                      }) => (
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
                    <Calendar className="w-4 h-4" />
                    Data
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full bg-[#0f0f0f] border-[#1f1f1f] text-white justify-start"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
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
                      status: value as AppointmentModalData['status'],
                    })
                  }
                >
                  <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    {(
                      Object.keys(
                        STATUS_LABELS
                      ) as AppointmentModalData['status'][]
                    ).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
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
                      source: value as AppointmentModalData['source'],
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
                    className={cn('text-white', STATUS_STYLES[formData.status])}
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
                      onClick={handleDelete}
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
    </>
  )
}
