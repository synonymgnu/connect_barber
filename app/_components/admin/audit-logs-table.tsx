"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Button } from "../ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Badge } from "../ui/badge"

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

export default function AuditLogsTable() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState('all')

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const url = actionFilter === 'all' 
        ? `/api/audit-logs?page=${page}&limit=20`
        : `/api/audit-logs?page=${page}&limit=20&action=${actionFilter}`
      const res = await fetch(url)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotalPages(data.totalPages || 1)
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLogs([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const getActionBadge = (action: string) => {
    if (action.includes('CREATE')) return <Badge className="bg-green-600">Criar</Badge>
    if (action.includes('UPDATE')) return <Badge className="bg-blue-600">Atualizar</Badge>
    if (action.includes('DELETE')) return <Badge className="bg-red-600">Excluir</Badge>
    if (action.includes('LOGIN')) return <Badge className="bg-purple-600">Login</Badge>
    return <Badge>{action}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="CREATE_BOOKING">Criar Agendamento</SelectItem>
              <SelectItem value="CANCEL_BOOKING">Cancelar Agendamento</SelectItem>
              <SelectItem value="UPDATE_BOOKING">Atualizar Agendamento</SelectItem>
              <SelectItem value="DELETE_BOOKING">Excluir Agendamento</SelectItem>
              <SelectItem value="UPDATE_BOOKING_STATUS">Mudar Status</SelectItem>
              <SelectItem value="CREATE_BARBERSHOP">Criar Barbearia</SelectItem>
            </SelectContent>
          </Select>
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
                  <TableCell className="text-xs text-muted-foreground">{log.ipAddress || '-'}</TableCell>
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
