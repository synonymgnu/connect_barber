'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Badge } from '@/app/_components/ui/badge'
import { Button } from '@/app/_components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/_components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/_components/ui/select'
import { Input } from '@/app/_components/ui/input'
import { ConfirmDialog } from '@/app/_components/confirm-dialog'
import { toast } from 'sonner'
import {
  Calendar,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  TrendingUp,
  Search,
  RefreshCw,
  BarChart3,
  Clock,
  Filter,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from 'recharts'

interface Booking {
  id: string
  clientName: string
  serviceName: string
  date: string
  status: string
  price: number
}

interface Stats {
  total: number
  completed: number
  cancelled: number
  revenue: number
  avgRating: number
}

interface Review {
  id: string
  value: number
  clientName: string
  serviceName: string
  date: string
}

interface BarberDashboardProps {
  bookings: Booking[]
  stats: Stats
  reviews: Review[]
  period: 'day' | 'week' | 'month'
  onPeriodChange: (p: 'day' | 'week' | 'month') => void
  onRefresh: () => void
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  CONFIRMED:  { label: 'Confirmado',  variant: 'default' },
  COMPLETED:  { label: 'Concluído',   variant: 'secondary' },
  CANCELLED:  { label: 'Cancelado',   variant: 'destructive' },
  PENDING:    { label: 'Pendente',    variant: 'outline' },
  NO_SHOW:    { label: 'Faltou',      variant: 'outline' },
}

export default function BarberDashboard({
  bookings,
  stats,
  reviews,
  period,
  onPeriodChange,
  onRefresh,
}: BarberDashboardProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingAction, setPendingAction] = useState<{ bookingId: string; action: 'complete' | 'cancel' } | null>(null)

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.clientName.toLowerCase().includes(search.toLowerCase()) ||
        b.serviceName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || b.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [bookings, search, statusFilter])

  const confirmAction = async () => {
    if (!pendingAction) return
    const { bookingId, action } = pendingAction
    const status = action === 'complete' ? 'COMPLETED' : 'CANCELLED'
    const res = await fetch(`/api/barber/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(action === 'complete' ? 'Serviço concluído!' : 'Agendamento cancelado!')
      onRefresh()
    } else {
      toast.error('Erro ao atualizar agendamento')
    }
    setPendingAction(null)
  }

  // Chart data: bookings per day of week
  const weekdayData = useMemo(() => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    const counts = Array(7).fill(0)
    bookings.forEach((b) => {
      const d = new Date(b.date).getDay()
      counts[d]++
    })
    return days.map((name, i) => ({ name, agendamentos: counts[i] }))
  }, [bookings])

  // Revenue by service
  const serviceRevenue = useMemo(() => {
    const map: Record<string, number> = {}
    bookings
      .filter((b) => b.status === 'COMPLETED')
      .forEach((b) => {
        map[b.serviceName] = (map[b.serviceName] || 0) + b.price
      })
    return Object.entries(map)
      .map(([name, value]) => ({ name, receita: value }))
      .sort((a, b) => b.receita - a.receita)
      .slice(0, 5)
  }, [bookings])

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Visão Geral</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-muted p-0.5 rounded-lg border">
            {(['day', 'week', 'month'] as const).map((p) => (
              <Button
                key={p}
                variant={period === p ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onPeriodChange(p)}
                className="text-xs"
              >
                {p === 'day' ? 'Hoje' : p === 'week' ? 'Semana' : 'Mês'}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={onRefresh} title="Atualizar">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ─── Stats Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, icon: Calendar, color: 'text-[#8161FF]', border: 'border-l-[#8161FF]' },
          { label: 'Concluídos', value: stats.completed, icon: CheckCircle, color: 'text-green-400', border: 'border-l-green-400' },
          { label: 'Cancelados', value: stats.cancelled, icon: XCircle, color: 'text-red-400', border: 'border-l-red-400' },
          { label: 'Avaliação', value: stats.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'text-yellow-400', border: 'border-l-yellow-400' },
          { label: 'Receita', value: `R$ ${stats.revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: 'text-[#8161FF]', border: 'border-l-[#8161FF]' },
        ].map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label} className={`border-l-4 ${card.border} hover:scale-[1.02] transition-transform`}>
              <CardHeader className="flex flex-row items-center justify-between pb-1 p-3">
                <CardTitle className="text-xs font-medium text-muted-foreground">{card.label}</CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="text-xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ─── Charts ─── */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Agendamentos por dia */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#8161FF]" />
              Agendamentos por Dia da Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekdayData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" fontSize={12} className="fill-muted-foreground" />
                <YAxis fontSize={12} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 8 }}
                />
                <Bar dataKey="agendamentos" fill="#8161FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de conclusão + receita por serviço */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-400" />
                Taxa de Conclusão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-400">{completionRate}%</div>
              <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full transition-all"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.completed} de {stats.total} concluídos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Avaliação Média
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-400">
                {stats.avgRating?.toFixed(1) || '—'}
              </div>
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${s <= Math.round(stats.avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`}
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{reviews.length} avaliações</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receita por serviço */}
      {serviceRevenue.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-[#8161FF]" />
              Receita por Serviço (Top 5)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={serviceRevenue} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" fontSize={11} className="fill-muted-foreground" tickFormatter={(v) => `R$${v}`} />
                <YAxis type="category" dataKey="name" fontSize={11} width={100} className="fill-muted-foreground" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 8 }}
                  formatter={(v: number) => [`R$ ${v.toFixed(2)}`, 'Receita']}
                />
                <Bar dataKey="receita" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ─── Agendamentos Table ─── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8161FF]" />
              Agendamentos
              <Badge variant="outline" className="text-xs">{filtered.length}</Badge>
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Buscar cliente ou serviço..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs w-48"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-36">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(STATUS_MAP).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Cliente</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Serviço</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Data/Hora</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Valor</th>
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                      Nenhum agendamento encontrado
                    </td>
                  </tr>
                )}
                {filtered.map((b) => {
                  const s = STATUS_MAP[b.status] || { label: b.status, variant: 'outline' as const }
                  return (
                    <tr key={b.id} className="border-b hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 font-medium">{b.clientName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{b.serviceName}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {format(new Date(b.date), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={s.variant} className="text-xs">{s.label}</Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">R$ {b.price.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        {b.status === 'CONFIRMED' || b.status === 'PENDING' ? (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-green-600 border-green-600/30 hover:bg-green-600/10"
                              onClick={() => setPendingAction({ bookingId: b.id, action: 'complete' })}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" /> Concluir
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs text-red-500 border-red-500/30 hover:bg-red-500/10"
                              onClick={() => setPendingAction({ bookingId: b.id, action: 'cancel' })}
                            >
                              <XCircle className="h-3 w-3 mr-1" /> Cancelar
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ─── Avaliações recentes ─── */}
      {reviews.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" />
              Avaliações Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reviews.slice(0, 6).map((r) => (
                <div key={r.id} className="p-3 rounded-lg border bg-muted/20 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= r.value ? 'text-yellow-400 fill-yellow-400' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(r.date), 'dd/MM/yy', { locale: ptBR })}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{r.clientName}</p>
                  <Badge variant="outline" className="text-xs">{r.serviceName}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
        title={pendingAction?.action === 'complete' ? 'Concluir Serviço' : 'Cancelar Agendamento'}
        description={
          pendingAction?.action === 'complete'
            ? 'Tem certeza que deseja marcar este serviço como concluído?'
            : 'Tem certeza que deseja cancelar este agendamento?'
        }
        onConfirm={confirmAction}
      />
    </div>
  )
}
