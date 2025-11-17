'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Calendar } from '@/app/_components/ui/calendar'
import { Textarea } from '@/app/_components/ui/textarea'
import { Badge } from '@/app/_components/ui/badge'
import { Switch } from '@/app/_components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover'
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, User, Store } from 'lucide-react'
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

interface Barber {
  id: string
  name: string
}

// Opções
const REASON_OPTIONS = [
  { value: 'FOLGA', label: 'Folga programada' },
  { value: 'FERIADO', label: 'Feriado' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'EVENTO', label: 'Evento especial' },
  { value: 'FALTA', label: 'Falta injustificada' },
  { value: 'OUTRO', label: 'Outro motivo' },
]

export function AbsenceManager() {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedBarber, setSelectedBarber] = useState<string>('')
  const [selectedReasonType, setSelectedReasonType] = useState<string>('FOLGA')
  const [customReason, setCustomReason] = useState<string>('')
  const [isAllDay, setIsAllDay] = useState(true)
  const [saving, setSaving] = useState(false)
  const [absenceType, setAbsenceType] = useState<'BARBER_ABSENCE' | 'SHOP_CLOSURE'>('BARBER_ABSENCE')

  const fetchAbsences = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/availability/absences')
      if (!response.ok) throw new Error('Erro ao carregar ausências')
      
      const data = await response.json()
      setAbsences(data.map((a: any) => ({
        ...a,
        date: new Date(a.date)
      })))
    } catch (error) {
      toast.error('Erro ao carregar ausências')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBarbers = useCallback(async () => {
    try {
      const response = await fetch('/api/barbershop/barbers')
      if (!response.ok) throw new Error('Erro ao carregar barbeiros')
      const data = await response.json()
      setBarbers(data)
    } catch (error) {
      console.error('Erro ao carregar barbeiros:', error)
      toast.error('Erro ao carregar lista de barbeiros')
    }
  }, [])

  useEffect(() => {
    fetchAbsences()
    fetchBarbers()
  }, [fetchAbsences, fetchBarbers])

  const handleAddAbsence = async () => {
    // Validação baseada no tipo
    if (absenceType === 'BARBER_ABSENCE' && !selectedBarber) {
      toast.error('Selecione um barbeiro para registrar ausência')
      return
    }
    
    if (!selectedDate) {
      toast.error('Selecione uma data')
      return
    }

    setSaving(true)
    try {
      // Lógica para motivo
      const reasonText = selectedReasonType === 'OUTRO' ? customReason : REASON_OPTIONS.find(r => r.value === selectedReasonType)?.label
      
      const payload = {
        date: selectedDate.toISOString(),
        barberId: absenceType === 'BARBER_ABSENCE' ? selectedBarber : null,
        type: absenceType,
        reason: reasonText?.trim() || '',
        isAllDay: Boolean(isAllDay)
      }

      console.log('Enviando dados:', payload) // Debug

      const response = await fetch('/api/availability/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const responseData = await response.json()
      console.log('📥 Resposta:', responseData) // Debug
      
      if (!response.ok) {
        throw new Error(responseData.details || responseData.error || 'Erro ao adicionar ausência')
      }
      
      toast.success(
        absenceType === 'SHOP_CLOSURE' 
          ? 'Fechamento da barbearia registrado com sucesso!' 
          : 'Ausência registrada com sucesso!'
      )
      
      // Reset form
      setDialogOpen(false)
      setSelectedDate(undefined)
      setSelectedBarber('')
      setSelectedReasonType('FOLGA')
      setCustomReason('')
      setIsAllDay(true)
      setAbsenceType('BARBER_ABSENCE')
      
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
      const response = await fetch(`/api/availability/absences/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Erro ao excluir ausência')
      
      toast.success('Registro excluído com sucesso!')
      fetchAbsences()
    } catch (error) {
      toast.error('Erro ao excluir registro')
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

  // mostrar/ocultar seletor barbeiro
  const showBarberSelector = absenceType === 'BARBER_ABSENCE'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <CardTitle className="text-white">Gerenciar Ausências e Fechamentos</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>Registrar Ausência ou Fechamento</DialogTitle>
              <DialogDescription className="text-slate-400">
                Marque um dia de ausência de barbeiro ou fechamento da barbearia
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Tipo de registro */}
              <div className="space-y-2">
                <Label className="text-white">Tipo</Label>
                <Select 
                  value={absenceType} 
                  onValueChange={(value) => setAbsenceType(value as 'BARBER_ABSENCE' | 'SHOP_CLOSURE')}
                >
                  <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                    <SelectItem value="BARBER_ABSENCE">Ausência de Barbeiro</SelectItem>
                    <SelectItem value="SHOP_CLOSURE">Fechamento da Barbearia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showBarberSelector && (
                <div className="space-y-2">
                  <Label className="text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Barbeiro
                  </Label>
                  <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                    <SelectTrigger className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                      <SelectValue placeholder="Selecione um barbeiro" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f0f] border-[#1f1f1f] text-white">
                      {barbers.length === 0 ? (
                        <SelectItem value="no-barbers" disabled>
                          Nenhum barbeiro cadastrado
                        </SelectItem>
                      ) : (
                        barbers.map(barber => (
                          <SelectItem key={barber.id} value={barber.id}>
                            {barber.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* fechamento */}
              {!showBarberSelector && (
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center gap-3">
                  <Store className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-blue-400 font-medium">Fechamento da Barbearia</p>
                    <p className="text-xs text-slate-400">Afetará todos os barbeiros</p>
                  </div>
                </div>
              )}

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

              {/* Motivo */}
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
                    placeholder="Descreva o motivo..."
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
                disabled={saving || !selectedDate || (showBarberSelector && !selectedBarber)}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
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
              <p className="text-slate-400">Nenhuma ausência ou fechamento programado</p>
            </CardContent>
          </Card>
        ) : (
          absences.map((absence) => (
            <Card key={absence.id} className="bg-[#0f0f0f] border-[#1f1f1f] hover:border-red-500/30 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={
                    absence.type === 'SHOP_CLOSURE' 
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                      : 'bg-red-500/20 text-red-400 border-red-500/30'
                  }>
                    {absence.type === 'SHOP_CLOSURE' ? 'Fechamento' : 'Ausência'}
                  </Badge>
                  <div>
                    <CardTitle className="text-sm font-medium text-white">
                      {format(absence.date, "dd/MM/yyyy", { locale: ptBR })}
                    </CardTitle>
                    <p className="text-xs text-slate-400">
                      {absence.type === 'SHOP_CLOSURE' ? 'Barbearia fechada' : absence.barberName}
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
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
                    <CalendarIcon className="h-3 w-3" />
                    {absence.isAllDay ? 'Dia todo' : 'Período parcial'}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}