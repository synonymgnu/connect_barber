'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Calendar } from '@/app/_components/ui/calendar'
import { Textarea } from '@/app/_components/ui/textarea'
import { Badge } from '@/app/_components/ui/badge'
import { Switch } from '@/app/_components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover'
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog'
import { Label } from '@/app/_components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/_components/ui/select'

interface Absence {
  id: string
  date: Date
  reason: string
  isAllDay: boolean
  barberId: string | null
  barberName: string | null
  type: 'BARBER_ABSENCE' | 'SHOP_CLOSURE'
}

const REASON_OPTIONS = [
  { value: 'FOLGA', label: 'Folga programada' },
  { value: 'FALTA', label: 'Falta justificada' },
  { value: 'MEDICO', label: 'Consulta médica' },
  { value: 'PESSOAL', label: 'Motivo pessoal' },
  { value: 'OUTRO', label: 'Outro motivo' },
]

export function BarberAbsenceManager() {
  const { data: session } = useSession()
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedReasonType, setSelectedReasonType] = useState<string>('FOLGA')
  const [customReason, setCustomReason] = useState<string>('')
  const [isAllDay, setIsAllDay] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchAbsences = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/barber/absences')
      if (!response.ok) throw new Error('Erro ao carregar ausências')
      
      const data = await response.json()
      setAbsences(data.map((a: any) => ({
        ...a,
        date: new Date(a.date)
      })))
    } catch (error) {
      toast.error('Erro ao carregar suas ausências')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAbsences()
  }, [fetchAbsences])

  const handleAddAbsence = async () => {
    if (!selectedDate) {
      toast.error('Selecione uma data')
      return
    }

    setSaving(true)
    try {
      const reasonText = selectedReasonType === 'OUTRO' ? customReason : REASON_OPTIONS.find(r => r.value === selectedReasonType)?.label
      
      const payload = {
        date: selectedDate.toISOString(),
        reason: reasonText?.trim() || '',
        isAllDay: Boolean(isAllDay)
      }

      const response = await fetch('/api/barber/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Erro ao registrar ausência')
      }
      
      toast.success('Ausência registrada com sucesso!')
      
      setDialogOpen(false)
      setSelectedDate(undefined)
      setSelectedReasonType('FOLGA')
      setCustomReason('')
      setIsAllDay(true)
      
      fetchAbsences()
    } catch (error) {
      console.error('Erro detalhado:', error)
      toast.error(error instanceof Error ? error.message : 'Erro ao registrar ausência')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAbsence = async (id: string) => {
    try {
      const response = await fetch(`/api/barber/absences/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Erro ao excluir ausência')
      
      toast.success('Ausência excluída com sucesso!')
      fetchAbsences()
    } catch (error) {
      toast.error('Erro ao excluir ausência')
      console.error(error)
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
      <div className="flex justify-between items-center">
        <CardTitle className="text-white">Minhas Ausências</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Ausência
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Ausência</DialogTitle>
              <DialogDescription className="text-slate-400">
                Informe ao administrador sobre sua ausência
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-blue-400 font-medium">Registrando para: {session?.user?.name}</p>
                  <p className="text-xs text-slate-400">Sua ausência será comunicada ao administrador</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-[#0f0f0f] border-[#1f1f1f] text-white justify-start"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd 'de' MMM yyyy", { locale: ptBR }) : "Selecione uma data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0c0c0c] border-[#1f1f1f]">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      locale={ptBR}
                      className="bg-[#0c0c0c] text-white"
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Motivo</Label>
                <Select value={selectedReasonType} onValueChange={setSelectedReasonType}>
                  <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    {REASON_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedReasonType === 'OUTRO' && (
                  <Textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Descreva o motivo da ausência..."
                    className="bg-[#0f0f0f] border-[#1f1f1f] text-white mt-2"
                    rows={2}
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={isAllDay}
                  onCheckedChange={setIsAllDay}
                  className="data-[state=checked]:bg-[#8161FF]"
                />
                <Label>Dia todo</Label>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleAddAbsence} 
                className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white"
                disabled={saving || !selectedDate}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  'Registrar'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {absences.length === 0 ? (
          <Card className="col-span-full bg-[#0f0f0f] border-[#1f1f1f]">
            <CardContent className="py-8 text-center">
              <CalendarIcon className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">Nenhuma ausência registrada</p>
            </CardContent>
          </Card>
        ) : (
          absences.map((absence) => (
            <Card key={absence.id} className="bg-[#0f0f0f] border-[#1f1f1f] hover:border-red-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                    Ausência
                  </Badge>
                  <div>
                    <CardTitle className="text-sm font-medium text-white">
                      {format(absence.date, "dd/MM/yyyy", { locale: ptBR })}
                    </CardTitle>
                    <p className="text-xs text-slate-400">
                      {absence.isAllDay ? 'Dia todo' : 'Período parcial'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAbsence(absence.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              {absence.reason && (
                <CardContent className="p-4 pt-0">
                  <p className="text-sm text-slate-300">{absence.reason}</p>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}