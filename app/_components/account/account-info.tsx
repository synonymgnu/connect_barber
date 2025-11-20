// app/_components/account/account-info.tsx
import { AccountInfoProps } from '../../../types/account'
import { Card, CardContent } from '../ui/card'
import { Button } from '../ui/button'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AccountInfo({
  user,
  bookings,
  barberStatus,
}: AccountInfoProps) {
  return (
    <Card className="w-full py-5 lg:px-7 self-start">
      <CardContent className="space-y-6">
        <h1 className="text-xl font-semibold">Informações da Conta</h1>

        <div className="text-lg">
          <span className="font-semibold">Tipo de conta: </span>
          <span className="uppercase">{user.role}</span>
        </div>

        {/* ===== CLIENTE ===== */}
        {user.role === 'CLIENT' && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Você é um cliente. Pode agendar serviços, avaliar barbearias e
              gerenciar seus dados pessoais.
            </p>
            <h2 className="font-semibold">Últimas reservas</h2>

            {bookings?.length === 0 && (
              <p className="text-muted-foreground">
                Nenhuma reserva encontrada.
              </p>
            )}

            {bookings?.slice(0, 3).map((b) => (
              <div key={b.id} className="border p-3 rounded-md">
                <p className="font-semibold">{b.service.name}</p>
                <p className="text-sm text-muted-foreground">
                  {' '}
                  {format(new Date(b.date), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ===== BARBEIRO ===== */}
        {user.role === 'BARBER' && (
          <div className="space-y-4">
            <div className="text-lg">
              <span className="font-semibold">Status: </span>
              <span
                className={
                  barberStatus === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                }
              >
                {barberStatus === 'ACTIVE' ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p className="text-muted-foreground">
              Você é um barbeiro. Pode visualizar sua agenda, editar horários,
              gerenciar clientes e administrar atendimentos.
            </p>

            <Button asChild variant="default">
              <Link href="/barber/schedule">Editar agenda</Link>
            </Button>
          </div>
        )}

        {/* ===== ADMIN ===== */}
        {user.role === 'ADMIN' && (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              Você é administrador. Possui acesso total ao painel, estatísticas,
              controle de barbearias e configurações avançadas.
            </p>

            <Button asChild>
              <Link href="/dashboard">Painel administrativo</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
