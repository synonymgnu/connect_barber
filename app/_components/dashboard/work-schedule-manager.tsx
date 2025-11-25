'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Input } from '@/app/_components/ui/input'
import { Switch } from '@/app/_components/ui/switch'
import { Badge } from '@/app/_components/ui/badge'
import { Trash2, Plus, Clock, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSession } from 'next-auth/react'

interface WorkSchedule {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

const daysOfWeek = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-feira', short: 'Seg' },
  { id: 2, name: 'Terça-feira', short: 'Ter' },
  { id: 3, name: 'Quarta-feira', short: 'Qua' },
  { id: 4, name: 'Quinta-feira', short: 'Qui' },
  { id: 5, name: 'Sexta-feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
]

export function WorkScheduleManager() {
  const { data: session } = useSession()
  const [schedules, setSchedules] = useState<WorkSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [barbershopSchedule, setBarbershopSchedule] = useState<WorkSchedule[]>([])

  const fetchSchedules = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/availability/schedule')
      if (!response.ok) throw new Error('Erro ao carregar horários')
      
      const data = await response.json()
      
      const shopSchedule = data.filter((s: any) => !s.barberId)
      setBarbershopSchedule(shopSchedule)
      
      const organized = daysOfWeek.map(day => {
        const existing = data.find((s: WorkSchedule) => s.dayOfWeek === day.id)
        const shopDay = shopSchedule.find((s: WorkSchedule) => s.dayOfWeek === day.id)
        
        return existing || {
          dayOfWeek: day.id,
          startTime: shopDay?.startTime || '09:00',
          endTime: shopDay?.endTime || '18:00',
          isActive: false
        }
      })
      setSchedules(organized)
    } catch (error) {
      toast.error('Erro ao carregar horários de trabalho')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedules()
  }, [fetchSchedules])

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newSchedules = [...schedules]
    newSchedules[index][field] = value
    setSchedules(newSchedules)
  }

  const handleToggleActive = (index: number, checked: boolean) => {
    const schedule = schedules[index]
    const shopDay = barbershopSchedule.find(s => s.dayOfWeek === schedule.dayOfWeek)
    
    if (checked && (!shopDay || !shopDay.isActive)) {
      toast.error('A barbearia está fechada neste dia')
      return
    }
    
    const newSchedules = [...schedules]
    newSchedules[index].isActive = checked
    setSchedules(newSchedules)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/availability/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules })
      })
      
      if (!response.ok) throw new Error('Erro ao salvar horários')
      
      toast.success('Horários de trabalho salvos com sucesso!')
    } catch (error) {
      toast.error('Erro ao salvar horários')
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-[#0f0f0f] border-[#1f1f1f]">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {schedules.map((schedule, index) => {
          const day = daysOfWeek.find(d => d.id === schedule.dayOfWeek)!
          return (
            <Card 
              key={schedule.dayOfWeek} 
              className={`bg-[#0f0f0f] border-[#1f1f1f] transition-all ${
                schedule.isActive ? 'ring-1 ring-[#8161FF]' : ''
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[#8161FF]/20 text-[#8161FF] border-[#8161FF]/30">
                    {day.short}
                  </Badge>
                  <CardTitle className="text-sm font-medium text-white">
                    {day.name}
                  </CardTitle>
                </div>
                <Switch
                  checked={schedule.isActive}
                  onCheckedChange={(checked) => handleToggleActive(index, checked)}
                  className="data-[state=checked]:bg-[#8161FF]"
                />
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <Input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    disabled={!schedule.isActive}
                    className="bg-[#0c0c0c] border-[#1f1f1f] text-white h-8 w-full"
                  />
                  <span className="text-slate-400">às</span>
                  <Input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    disabled={!schedule.isActive}
                    className="bg-[#0c0c0c] border-[#1f1f1f] text-white h-8 w-full"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Horários
            </>
          )}
        </Button>
      </div>
    </div>
  )
}