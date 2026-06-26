'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { Switch } from '@/app/_components/ui/switch'
import { Badge } from '@/app/_components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { Clock, Save, Loader2, Store, Scissors } from 'lucide-react'
import { useShopSchedule, useBarberSchedule, useUpdateSchedule, WorkSchedule } from '@/app/_hooks/use-work-schedule'

const DAYS = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
]

const DEFAULT_SCHEDULE: WorkSchedule[] = DAYS.map(d => ({
  dayOfWeek: d.id,
  startTime: '09:00',
  endTime: '18:00',
  isActive: false,
}))

function mergeWithDefaults(data: WorkSchedule[]): WorkSchedule[] {
  return DAYS.map(day => {
    const existing = data.find(s => s.dayOfWeek === day.id)
    return existing ?? { dayOfWeek: day.id, startTime: '09:00', endTime: '18:00', isActive: false }
  })
}

function ScheduleGrid({
  schedules,
  onChange,
}: {
  schedules: WorkSchedule[]
  onChange: (updated: WorkSchedule[]) => void
}) {
  const update = (index: number, field: keyof WorkSchedule, value: any) => {
    const next = [...schedules]
    next[index] = { ...next[index], [field]: value }
    onChange(next)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {schedules.map((schedule, index) => {
        const day = DAYS.find(d => d.id === schedule.dayOfWeek)!
        return (
          <Card
            key={schedule.dayOfWeek}
            className={`bg-[#0f0f0f] border-[#1f1f1f] transition-all ${schedule.isActive ? 'ring-1 ring-[#8161FF]' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-[#8161FF]/20 text-[#8161FF] border-[#8161FF]/30">
                  {day.short}
                </Badge>
                <CardTitle className="text-sm font-medium text-white">{day.name}</CardTitle>
              </div>
              <Switch
                checked={schedule.isActive}
                onCheckedChange={v => update(index, 'isActive', v)}
                className="data-[state=checked]:bg-[#8161FF]"
              />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <Input
                  type="time"
                  value={schedule.startTime}
                  onChange={e => update(index, 'startTime', e.target.value)}
                  disabled={!schedule.isActive}
                  className="bg-[#0c0c0c] border-[#1f1f1f] text-white h-8 w-full"
                />
                <span className="text-slate-400 shrink-0">às</span>
                <Input
                  type="time"
                  value={schedule.endTime}
                  onChange={e => update(index, 'endTime', e.target.value)}
                  disabled={!schedule.isActive}
                  className="bg-[#0c0c0c] border-[#1f1f1f] text-white h-8 w-full"
                />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function ShopScheduleTab() {
  const { data, isLoading } = useShopSchedule()
  const { mutate, isPending } = useUpdateSchedule()
  const [schedules, setSchedules] = useState<WorkSchedule[] | null>(null)

  const current = schedules ?? (data ? mergeWithDefaults(data) : DEFAULT_SCHEDULE)

  if (isLoading) return <Loader2 className="h-8 w-8 animate-spin text-slate-500 mx-auto mt-8" />

  return (
    <div className="space-y-6">
      <ScheduleGrid
        schedules={current}
        onChange={updated => setSchedules(updated)}
      />
      <div className="flex justify-end">
        <Button
          onClick={() => mutate({ type: 'shop', schedules: current })}
          disabled={isPending}
          className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white"
        >
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {isPending ? 'Salvando...' : 'Salvar Horários da Loja'}
        </Button>
      </div>
    </div>
  )
}

function BarberScheduleTab() {
  const { data: barbers, isLoading: loadingBarbers } = useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const res = await fetch('/api/barbers')
      if (!res.ok) throw new Error('Erro ao carregar barbeiros')
      return res.json() as Promise<{ id: string; name: string }[]>
    },
  })

  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)
  const { data, isLoading } = useBarberSchedule(selectedBarberId)
  const { mutate, isPending } = useUpdateSchedule()
  const [schedules, setSchedules] = useState<WorkSchedule[] | null>(null)
  const [prevBarberId, setPrevBarberId] = useState<string | null>(null)

  // Reseta edição local ao trocar de barbeiro
  if (selectedBarberId !== prevBarberId) {
    setSchedules(null)
    setPrevBarberId(selectedBarberId)
  }

  const current = schedules ?? (data ? mergeWithDefaults(data) : DEFAULT_SCHEDULE)

  return (
    <div className="space-y-6">
      <div className="max-w-xs">
        {loadingBarbers ? (
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
        ) : (
          <Select onValueChange={v => setSelectedBarberId(v)}>
            <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
              <SelectValue placeholder="Selecione um barbeiro" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f]">
              {barbers?.map(b => (
                <SelectItem key={b.id} value={b.id} className="text-white hover:bg-[#1f1f1f]">
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedBarberId && (
        isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-slate-500 mx-auto" />
        ) : (
          <div className="space-y-6">
            <ScheduleGrid schedules={current} onChange={setSchedules} />
            <div className="flex justify-end">
              <Button
                onClick={() => mutate({ type: 'barber', barberId: selectedBarberId, schedules: current })}
                disabled={isPending}
                className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white"
              >
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {isPending ? 'Salvando...' : 'Salvar Horários do Barbeiro'}
              </Button>
            </div>
          </div>
        )
      )}
    </div>
  )
}

export function WorkScheduleManager() {
  return (
    <Tabs defaultValue="shop">
      <TabsList className="bg-[#0f0f0f] border border-[#1f1f1f] p-1 mb-6">
        <TabsTrigger value="shop" className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white">
          <Store className="w-4 h-4 mr-2" />
          Horário da Loja
        </TabsTrigger>
        <TabsTrigger value="barber" className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white">
          <Scissors className="w-4 h-4 mr-2" />
          Por Barbeiro
        </TabsTrigger>
      </TabsList>

      <TabsContent value="shop">
        <ShopScheduleTab />
      </TabsContent>

      <TabsContent value="barber">
        <BarberScheduleTab />
      </TabsContent>
    </Tabs>
  )
}
