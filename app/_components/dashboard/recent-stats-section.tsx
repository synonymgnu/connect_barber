"use client"

import { useEffect, useState, useCallback, memo } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Download
} from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { 
  ResponsiveContainer, 
  ScatterChart,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip // ✅ Renomeado para evitar conflito
} from "recharts"
import { Skeleton } from "../ui/skeleton"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

interface StatData {
  count: number
  percentage: number
}

interface DashboardStats {
  bookings: StatData
  revenue: StatData
  customers: StatData
  barbers: StatData
}

interface DataPoint {
  x: number
  y: number
  value: string
  size: number
  color: string
  label: string
  type: keyof DashboardStats
  percentage: number
}

const COLORS = {
  bookings: '#8161FF',
  revenue: '#10b981',
  customers: '#f97316',
  barbers: '#ec4899'
}

function RecentStatsSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/dashboard/recent-stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      
      const data = await response.json()
      setStats(data)
      setLastUpdate(new Date())
    } catch (err) {
      setError('Erro ao carregar estatísticas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    
    const interval = setInterval(fetchStats, 600000)
    
    return () => clearInterval(interval)
  }, [fetchStats])

  const handleRefresh = async () => {
    toast.loading('Atualizando estatísticas...')
    await fetchStats()
    toast.dismiss()
    toast.success('Estatísticas atualizadas!')
  }

  const handleExport = () => {
    if (!stats) return
    
    const data = {
      barbearia: 'Minha Barbearia',
      data: format(new Date(), 'dd/MM/yyyy HH:mm'),
      estatisticas: {
        'Agendamentos (7 dias)': stats.bookings.count,
        'Receita (7 dias)': `R$ ${stats.revenue.count.toFixed(2)}`,
        'Clientes (7 dias)': stats.customers.count,
        'Barbeiros Ativos': stats.barbers.count
      }
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estatisticas-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Dados exportados com sucesso!')
  }

  const prepareChartData = (): DataPoint[] => {
    if (!stats) return []

    const mainData: DataPoint[] = [
      {
        x: 2,
        y: 30,
        value: stats.bookings.count.toString(),
        size: Math.min(100, 40 + stats.bookings.count * 1.5),
        color: COLORS.bookings,
        label: 'Agendamentos',
        type: 'bookings',
        percentage: stats.bookings.percentage
      },
      {
        x: 3.5,
        y: 60,
        value: `R$ ${(stats.revenue.count / 1000).toFixed(1)}k`,
        size: Math.min(110, 50 + (stats.revenue.count / 100) * 1.2),
        color: COLORS.revenue,
        label: 'Receita',
        type: 'revenue',
        percentage: stats.revenue.percentage
      },
      {
        x: 5,
        y: 35,
        value: stats.customers.count.toString(),
        size: Math.min(90, 35 + stats.customers.count * 2),
        color: COLORS.customers,
        label: 'Clientes',
        type: 'customers',
        percentage: stats.customers.percentage
      },
      {
        x: 6.5,
        y: 70,
        value: stats.barbers.count.toString(),
        size: Math.min(80, 30 + stats.barbers.count * 8),
        color: COLORS.barbers,
        label: 'Barbeiros',
        type: 'barbers',
        percentage: stats.barbers.percentage
      }
    ]

    const decorativePoints = [
      { x: 2.3, y: 70, value: "", size: 8, color: COLORS.bookings, label: "Booking", type: 'bookings' as const, percentage: 0 },
      { x: 3.8, y: 35, value: "", size: 10, color: COLORS.revenue, label: "Venda", type: 'revenue' as const, percentage: 0 },
      { x: 5.3, y: 65, value: "", size: 9, color: COLORS.customers, label: "Cliente", type: 'customers' as const, percentage: 0 },
      { x: 6.8, y: 45, value: "", size: 7, color: COLORS.barbers, label: "Barbeiro", type: 'barbers' as const, percentage: 0 },
    ]

    return [...mainData, ...decorativePoints]
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DataPoint
      return (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold text-sm">{data.label}</p>
          <p className="text-slate-400 text-xs mt-1">
            Valor: <span className="font-mono">{data.value || '-'}</span>
          </p>
          <div className="flex items-center gap-1 mt-2">
            {data.percentage > 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )}
            <span className={`text-xs font-medium ${
              data.percentage > 0 ? 'text-emerald-500' : 'text-red-500'
            }`}>
              {data.percentage > 0 ? '+' : ''}{data.percentage}%
            </span>
            <span className="text-slate-500 text-xs">vs período anterior</span>
          </div>
        </div>
      )
    }
    return null
  }

  const renderCustomShape = (props: any) => {
    const { cx, cy, payload } = props

    if (!payload.value) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={payload.size / 2}
          fill={payload.color}
          fillOpacity={0.6}
        />
      )
    }

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={payload.size / 2}
          fill={payload.color}
          fillOpacity={0.85}
          filter="url(#glow)"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={Math.max(10, payload.size * 0.18)}
          fontWeight="bold"
          className="font-mono"
        >
          {payload.value}
        </text>
      </g>
    )
  }

  if (loading) {
    return (
      <Card className="bg-[#0c0c0c] border-[#1f1f1f]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="bg-[#0c0c0c] border-[#1f1f1f]">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchStats}
              className="text-slate-400 border-slate-700 hover:bg-slate-800/50"
            >
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const chartData = prepareChartData()

  return (
    <Card className="flex flex-col h-full w-full bg-[#0c0c0c] border-[#1f1f1f]">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold text-white">
              Estatísticas Recentes
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Últimos 7 dias • Atualizado {format(lastUpdate, "HH:mm", { locale: ptBR })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-white h-8 w-8"
                    onClick={handleExport}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Exportar dados</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-white h-8 w-8"
                    onClick={handleRefresh}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Atualizar agora</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] lg:min-h-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: -10, bottom: 10, left: -10 }}
              style={{ overflow: "visible" }}
            >
              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                stroke="#212121"
                strokeWidth={0.5}
                style={{ pointerEvents: "none" }}
                vertical={false}
              />
              
              <XAxis
                type="number"
                dataKey="x"
                domain={[1.5, 7]}
                hide={true}
              />
              
              <YAxis
                type="number"
                domain={[0, 100]}
                hide={true}
              />
              
              {/* ✅ CORRETO: Passando CustomTooltip via prop 'content' */}
              <RechartsTooltip content={<CustomTooltip />} />
              
              <Scatter 
                data={chartData}
                dataKey="y"
                shape={renderCustomShape}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.bookings }} />
            <span className="text-xs sm:text-sm text-slate-400">Agendamentos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.revenue }} />
            <span className="text-xs sm:text-sm text-slate-400">Receita</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.customers }} />
            <span className="text-xs sm:text-sm text-slate-400">Clientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.barbers }} />
            <span className="text-xs sm:text-sm text-slate-400">Barbeiros</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default memo(RecentStatsSection)