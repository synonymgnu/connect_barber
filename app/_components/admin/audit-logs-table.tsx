"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"
import { Download } from "lucide-react"

interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    name: string | null
    email: string | null
  } | null
}

const ACTION_LABELS: Record<string, string> = {
  // Agendamentos
  CREATE_BOOKING: 'Criar Agendamento',
  CANCEL_BOOKING: 'Cancelar Agendamento',
  UPDATE_BOOKING: 'Atualizar Agendamento',
  DELETE_BOOKING: 'Excluir Agendamento',
  UPDATE_BOOKING_STATUS: 'Mudar Status do Agendamento',
  // Barbearia
  UPDATE_BARBERSHOP: 'Atualizar Barbearia',
  // Serviços
  CREATE_SERVICE: 'Criar Serviço',
  UPDATE_SERVICE: 'Atualizar Serviço',
  DELETE_SERVICE: 'Excluir Serviço',
  // Equipe
  CREATE_BARBER: 'Criar Barbeiro',
  UPDATE_BARBER: 'Atualizar Barbeiro',
  DELETE_BARBER: 'Excluir Barbeiro',
  UPDATE_SCHEDULE: 'Atualizar Agenda',
  // Relatórios
  EXPORT_DATA: 'Exportar Dados',
}

const ACTION_GROUPS = [
  { label: 'Agendamentos', actions: ['CREATE_BOOKING', 'CANCEL_BOOKING', 'UPDATE_BOOKING', 'DELETE_BOOKING', 'UPDATE_BOOKING_STATUS'] },
  { label: 'Barbearia', actions: ['UPDATE_BARBERSHOP'] },
  { label: 'Serviços', actions: ['CREATE_SERVICE', 'UPDATE_SERVICE', 'DELETE_SERVICE'] },
  { label: 'Equipe', actions: ['CREATE_BARBER', 'UPDATE_BARBER', 'DELETE_BARBER', 'UPDATE_SCHEDULE'] },
  { label: 'Relatórios', actions: ['EXPORT_DATA'] },
]

function formatIp(ip: string | null) {
  if (!ip || ip === 'server-action' || ip === 'client-app') return 'Ação interna'
  return ip
}

export default function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')
  const [exporting, setExporting] = useState(false)

  const buildUrl = useCallback((p: number, action: string, limit = 20, isExport = false) => {
    const params = new URLSearchParams({ page: String(p), limit: String(limit) })
    if (action !== 'all') params.set('action', action)
    if (isExport) params.set('export', 'true')
    return `/api/audit-logs?${params}`
  }, [])

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(buildUrl(page, actionFilter))
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLogs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [page, actionFilter, buildUrl])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(buildUrl(1, actionFilter, 10000, true))
      const data = await res.json()
      const rows: AuditLog[] = data.logs || []

      const csvHeader = 'Data,Hora,Usuário,Email,Ação,Recurso,IP'
      const csvRows = rows.map(log => [
        new Date(log.createdAt).toLocaleDateString('pt-BR'),
        new Date(log.createdAt).toLocaleTimeString('pt-BR'),
        log.user?.name || '',
        log.user?.email || '',
        ACTION_LABELS[log.action] || log.action,
        log.resource,
        formatIp(log.ipAddress),
      ].map(v => `"${v}"`).join(','))

      const csv = [csvHeader, ...csvRows].join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(false)
    }
  }

  const getActionBadge = (action: string) => {
    const label = ACTION_LABELS[action] || action
    if (action.includes('CREATE')) return <Badge className="bg-green-600 whitespace-nowrap">{label}</Badge>
    if (action.includes('UPDATE')) return <Badge className="bg-blue-600 whitespace-nowrap">{label}</Badge>
    if (action.includes('DELETE') || action === 'CANCEL_BOOKING') return <Badge className="bg-red-600 whitespace-nowrap">{label}</Badge>
    if (action === 'EXPORT_DATA') return <Badge className="bg-yellow-600 whitespace-nowrap">{label}</Badge>
    return <Badge className="whitespace-nowrap">{label}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-lg">Logs de Auditoria {total > 0 && <span className="text-sm font-normal text-muted-foreground ml-2">({total} registros)</span>}</CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filtrar por ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as ações</SelectItem>
                {ACTION_GROUPS.map(group => (
                  <>
                    <div key={group.label} className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">{group.label}</div>
                    {group.actions.map(action => (
                      <SelectItem key={action} value={action} className="pl-4">
                        {ACTION_LABELS[action]}
                      </SelectItem>
                    ))}
                  </>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={exporting || loading || logs.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Recurso</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Carregando...</TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Nenhum log encontrado</TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm">
                    {new Date(log.createdAt).toLocaleDateString('pt-BR')}<br/>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </TableCell>
                  <TableCell>{log.user?.name || log.user?.email || 'Sistema'}</TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell className="capitalize">{log.resource}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatIp(log.ipAddress)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {logs.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              size="sm"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">Página {page} de {totalPages}</span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading}
              size="sm"
            >
              Próxima
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
