import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/_components/ui/table"
import { Badge } from "@/app/_components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select"
import { CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { ConfirmDialog } from "./confirm-dialog"
import { useState } from "react"

interface Booking {
  id: string
  clientName: string
  serviceName: string
  date: string
  status: string
  price: number
}

export default function BookingsTable({ bookings, onRefresh }: { bookings: Booking[], onRefresh: () => void }) {
  const [pendingAction, setPendingAction] = useState<{ bookingId: string, action: 'complete' | 'cancel' } | null>(null)

  const handleActionChange = (bookingId: string, action: string) => {
    if (action === 'complete') {
      setPendingAction({ bookingId, action: 'complete' })
    } else if (action === 'cancel') {
      setPendingAction({ bookingId, action: 'cancel' })
    } else {
      setPendingAction(null)
    }
  }

  const confirmAction = async () => {
    if (!pendingAction) return

    const { bookingId, action } = pendingAction
    const status = action === 'complete' ? 'COMPLETED' : 'CANCELLED'

    const res = await fetch(`/api/barber/bookings/${bookingId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status })
    })

    if (res.ok) {
      toast.success(action === 'complete' ? "Serviço concluído!" : "Agendamento cancelado!")
      onRefresh()
    } else {
      toast.error(`Erro ao ${action === 'complete' ? 'concluir' : 'cancelar'} agendamento`)
      console.error(`Error ${action}ing booking:`, res.statusText)
    }

    setPendingAction(null)
  }

  return (
    <>
      <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Cliente</TableHead>
          <TableHead>Serviço</TableHead>
          <TableHead>Data/Hora</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">{booking.clientName}</TableCell>
            <TableCell>{booking.serviceName}</TableCell>
            <TableCell>{format(new Date(booking.date), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
            <TableCell>
              <Badge
                variant={
                  booking.status === "CONFIRMED" ? "default" :
                  booking.status === "COMPLETED" ? "secondary" :
                  booking.status === "CANCELLED" ? "destructive" : "outline"
                }
              >
                {booking.status}
              </Badge>
            </TableCell>
            <TableCell>R$ {booking.price.toFixed(2)}</TableCell>
            <TableCell className="min-w-[180px]">
              {booking.status === "CONFIRMED" ? (
                <Select onValueChange={(value) => handleActionChange(booking.id, value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Escolher ação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aguardando</SelectItem>
                    <SelectItem value="complete">
                      <CheckCircle className="h-4 w-4 mr-2 inline text-green-500" />
                      Concluir serviço
                    </SelectItem>
                    <SelectItem value="cancel">
                      <XCircle className="h-4 w-4 mr-2 inline text-red-500" />
                      Cancelar agendamento
                    </SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-muted-foreground text-sm">Status finalizado</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Confirmation Dialog */}
    <ConfirmDialog
      open={!!pendingAction}
      onOpenChange={(open) => !open && setPendingAction(null)}
      title={pendingAction?.action === 'complete' ? "Concluir Serviço" : "Cancelar Agendamento"}
      description={
        pendingAction?.action === 'complete'
          ? "Tem certeza que deseja marcar este serviço como concluído?"
          : "Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita."
      }
      onConfirm={confirmAction}
    />
    </>
  )
}
