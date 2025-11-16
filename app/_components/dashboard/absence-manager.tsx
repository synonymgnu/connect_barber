'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import { Calendar } from '@/app/_components/ui/calendar'
import { Textarea } from '@/app/_components/ui/textarea'
import { Badge } from '@/app/_components/ui/badge'
import { Switch } from '@/app/_components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/_components/ui/popover'
import { Calendar as CalendarIcon, Plus, Trash2, Loader2 } from 'lucide-react'
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

interface Absence {
  id: string
  date: Date
  reason: string
  isAllDay: boolean
}

export function AbsenceManager() {
  const [absences, setAbsences] = useState<Absence[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [reason, setReason] = useState('')
  const [isAllDay, setIsAllDay] = useState(true)

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

  useEffect(() => {
    fetchAbsences()
  }, [fetchAbsences])

  const handleAddAbsence = async () => {
    if (!selectedDate) {
      toast.error('Selecione uma data')
      return
    }

    try {
      const response = await fetch('/api/availability/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          reason,
          isAllDay
        })
      })
      
      if (!response.ok) throw new Error('Erro ao adicionar ausência')
      
      toast.success('Ausência adicionada com sucesso!')
      setDialogOpen(false)
      setSelectedDate(undefined)
      setReason('')
      setIsAllDay(true)
      fetchAbsences()
    } catch (error) {
      toast.error('Erro ao adicionar ausência')
      console.error(error)
    }
  }

  const handleDeleteAbsence = async (id: string) => {
    try {
      const response = await fetch(`/api/availability/absences/${id}`, {
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
        <CardTitle className="text-white">Gerenciar Ausências</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#8161FF] hover:bg-[#8161FF]/80 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Ausência
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white">
            <DialogHeader>
              <DialogTitle>Nova Ausência</DialogTitle>
              <DialogDescription className="text-slate-400">
                Marque um dia ou período em que a barbearia não estará disponível
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full bg-[#0f0f0f] border-[#1f1f1f] text-white"
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Motivo (opcional)</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Feriado, evento especial, etc."
                  className="bg-[#0f0f0f] border-[#1f1f1f] text-white"
                />
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddAbsence} className="bg-[#8161FF] hover:bg-[#8161FF]/80">
                Adicionar
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
              <p className="text-slate-400">Nenhuma ausência programada</p>
            </CardContent>
          </Card>
        ) : (
          absences.map((absence) => (
            <Card key={absence.id} className="bg-[#0f0f0f] border-[#1f1f1f]">
              <CardHeader className="flex flex-row items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
                    Ausência
                  </Badge>
                  <CardTitle className="text-sm font-medium text-white">
                    {format(absence.date, "dd/MM/yyyy", { locale: ptBR })}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAbsence(absence.id)}
                  className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {absence.reason && (
                  <p className="text-sm text-slate-300">{absence.reason}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <CalendarIcon className="h-3 w-3" />
                  {absence.isAllDay ? 'Dia todo' : 'Período parcial'}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}