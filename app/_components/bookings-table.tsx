import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/_components/ui/table"
import { Button } from "@/app/_components/ui/button"
import { Badge } from "@/app/_components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

export default function BookingsTable({ bookings, onRefresh }: { bookings: any[], onRefresh: () => void }) {
  const markCompleted = async (id: string) => {
    await fetch(`/api/barber/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status: "COMPLETED" }) })
    toast.success("Serviço concluído!")
    onRefresh()
  }

  const cancelBooking = async (id: string) => {
    await fetch(`/api/barber/bookings/${id}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) })
    toast.error("Agendamento cancelado!")
    onRefresh()
  }

  return (
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
            <TableCell>
              <div className="flex gap-2">
                {booking.status === "CONFIRMED" && (
                  <>
                    <Button size="sm" onClick={() => markCompleted(booking.id)}>
                      <CheckCircle className="h-4 w-4 mr-1" /> Concluir
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => cancelBooking(booking.id)}>
                      <XCircle className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}