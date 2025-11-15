"use client"

import { Button } from "../ui/button"
import { Calendar } from "../ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { format, setHours, setMinutes } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Check, MoreHorizontal, Pencil, Trash2, X } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog"

interface AppointmentModalProps {
  appointment: any
  open: boolean
  onClose: () => void
  onSave: (data: any) => void
  onDelete: (id: string) => void
  barbershopServices: any[]
  barbers: any[]
  mode?: 'view' | 'edit'
}

const sourceConfig = {
  PRESENCIAL: { label: 'Presencial', color: 'text-[#8161FF]' },
  ONLINE: { label: 'Online', color: 'text-orange-500' }
}

export function AppointmentModal({ 
  appointment, 
  open, 
  onClose, 
  onSave, 
  onDelete, 
  barbershopServices, 
  barbers,
  mode = 'view'
}: AppointmentModalProps) {
  const [isEditing, setIsEditing] = useState(mode === 'edit')
  const [hasChanges, setHasChanges] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date(),
    serviceId: '',
    barberId: '',
    status: 'CONFIRMED'
  })

  useEffect(() => {
    if (open) {
      setIsEditing(mode === 'edit')
      setHasChanges(false)
    }
  }, [open, mode])

  useEffect(() => {
  const dateToParse = appointment?.dateIso || appointment?.date;
  
  if (dateToParse) {
    const dateObj = typeof dateToParse === 'string' 
      ? new Date(dateToParse) 
      : dateToParse
    
    if (!isNaN(dateObj.getTime())) {
      setFormData({
        date: dateObj,
        serviceId: appointment.serviceId || '',
        barberId: appointment.employeeId || '',
        status: appointment.status?.toUpperCase() || 'CONFIRMED'
      })
    }
  }
}, [appointment])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const handleSave = () => {
    const dataToSave = {
      ...formData,
      id: appointment.id,
      date: formData.date?.toISOString() || new Date().toISOString()
    }
    
    onSave(dataToSave)
    setIsEditing(false)
    setHasChanges(false)
  }

  const handleClose = () => {
    if (hasChanges && isEditing) {
      setShowConfirmDialog(true)
    } else {
      setIsEditing(false)
      setHasChanges(false)
      onClose()
    }
  }

  const handleConfirmClose = () => {
    setShowConfirmDialog(false)
    setIsEditing(false)
    setHasChanges(false)
    onClose()
  }

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      onDelete(appointment.id)
    }
  }

  const handleUndoChanges = () => {
    if (appointment?.date) {
      const dateObj = typeof appointment.date === 'string' 
        ? new Date(appointment.date)
        : appointment.date instanceof Date
        ? appointment.date
        : new Date(appointment.date)
      
      setFormData({
        date: dateObj,
        serviceId: appointment.serviceId || '',
        barberId: appointment.employeeId || '',
        status: appointment.status?.toUpperCase() || 'CONFIRMED'
      })
    }
    setHasChanges(false)
  }

  if (!appointment) return null

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-xl">Agendamento</DialogTitle>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 h-9 w-9 p-0">
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIsEditing(true)} className="bg-[#8161FF] hover:bg-[#8161FF]/80 h-9 w-9 p-0">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white h-9 w-9 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#0f0f0f] border-slate-700">
                  {hasChanges && (
                    <DropdownMenuItem onClick={handleUndoChanges} className="text-slate-300">
                      <X className="mr-2 h-4 w-4" />Desfazer mudanças
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleDelete} className="text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />Excluir agendamento
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Data e Hora */}
            <div className="space-y-2">
              <Label>Data e Hora</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    disabled={!isEditing}
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-[#0f0f0f] border-slate-700 text-white"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date && !isNaN(formData.date.getTime()) 
                      ? format(formData.date, "PPP 'às' HH:mm", { locale: ptBR }) 
                      : "Selecione uma data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#0f0f0f] border-slate-700">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => {
                      if (date) handleChange('date', date)
                    }}
                    disabled={!isEditing}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={formData.date ? formData.date.getHours().toString().padStart(2, '0') : '00'}
                    onChange={(e) => {
                      const hours = parseInt(e.target.value) || 0
                      handleChange('date', setHours(formData.date, Math.min(23, Math.max(0, hours))))
                    }}
                    className="bg-[#0f0f0f] border-slate-700"
                    placeholder="Hora"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={formData.date ? formData.date.getMinutes().toString().padStart(2, '0') : '00'}
                    onChange={(e) => {
                      const minutes = parseInt(e.target.value) || 0
                      handleChange('date', setMinutes(formData.date, Math.min(59, Math.max(0, minutes))))
                    }}
                    className="bg-[#0f0f0f] border-slate-700"
                    placeholder="Minuto"
                  />
                </div>
              )}
            </div>

            {/* Serviço */}
            <div className="space-y-2">
              <Label>Tipo de Corte</Label>
              <Select 
                value={formData.serviceId} 
                onValueChange={(val) => handleChange('serviceId', val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-[#0f0f0f] border-slate-700 text-white">
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-slate-700">
                  {barbershopServices?.map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - R$ {Number(service.price).toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Barbeiro */}
            <div className="space-y-2">
              <Label>Barbeiro</Label>
              <Select 
                value={formData.barberId || ''} 
                onValueChange={(val) => handleChange('barberId', val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-[#0f0f0f] border-slate-700 text-white">
                  <SelectValue placeholder="Selecione um barbeiro" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-slate-700">
                  {barbers?.map((barber: any) => (
                    <SelectItem key={barber.id} value={barber.id}>
                      {barber.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(val) => handleChange('status', val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="bg-[#0f0f0f] border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-slate-700">
                  <SelectItem value="PENDING">Pendente</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                  <SelectItem value="COMPLETED">Concluído</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Detalhes do cliente */}
            <div className="space-y-2 pt-4 border-t border-slate-700">
              <h3 className="text-lg font-medium">Cliente</h3>
              <div className="bg-[#0f0f0f] p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Nome:</span>
                  <span className="text-white">{appointment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-white">{appointment.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telefone:</span>
                  <span className="text-white">{appointment.customerPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Origem:</span>
                  <span className={sourceConfig[appointment.source as keyof typeof sourceConfig]?.color}>
                    {sourceConfig[appointment.source as keyof typeof sourceConfig]?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alerta ao sair com mudanças */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-[#0c0c0c] border-[#1f1f1f] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Você tem alterações não salvas. Deseja realmente sair?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#0f0f0f] border-slate-700 text-white hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose} className="bg-red-600 hover:bg-red-700">
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}