"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MoreHorizontal, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { 
  CartesianGrid, 
  ResponsiveContainer, 
  Scatter, 
  ScatterChart, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts"
import { Skeleton } from "../ui/skeleton"

interface StatData {
  count: number
  percentage: number
}

interface DashboardStats {
  bookings: StatData
  users: StatData
  barbershops: StatData
  revenue: StatData
}

interface DataPoint {
  x: number
  y: number
  value: string
  size: number
  color: string
  label: string
  type: 'bookings' | 'users' | 'barbershops' | 'revenue'
  percentage: number
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{ payload: DataPoint }>
}

const COLORS = {
  bookings: '#8161FF',
  users: '#f97316',
  barbershops: '#ec4899',
  revenue: '#10b981'
}

export default function RecentStatsSection() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError('Erro ao carregar estatísticas')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStats, 300000)
    
    return () => clearInterval(interval)
  }, [])

  const prepareChartData = (): DataPoint[] => {
    if (!stats) return []

    const data: DataPoint[] = [
      {
        x: 5,
        y: 20 + Math.random() * 20,
        value: stats.users.count.toString(),
        size: Math.min(80, 30 + stats.users.count * 2),
        color: COLORS.users,
        label: 'Novos Usuários',
        type: 'users',
        percentage: stats.users.percentage
      },
      {
        x: 6.5,
        y: 50 + Math.random() * 30,
        value: `R$ ${(stats.revenue.count / 1000).toFixed(1)}k`,
        size: Math.min(100, 40 + (stats.revenue.count / 100) * 2),
        color: COLORS.revenue,
        label: 'Receita',
        type: 'revenue',
        percentage: stats.revenue.percentage
      },
      {
        x: 8,
        y: 30 + Math.random() * 20,
        value: stats.barbershops.count.toString(),
        size: Math.min(90, 35 + stats.barbershops.count * 3),
        color: COLORS.barbershops,
        label: 'Barbearias',
        type: 'barbershops',
        percentage: stats.barbershops.percentage
      },
      {
        x: 9.5,
        y: 60 + Math.random() * 25,
        value: stats.bookings.count.toString(),
        size: Math.min(120, 50 + stats.bookings.count * 1.5),
        color: COLORS.bookings,
        label: 'Agendamentos',
        type: 'bookings',
        percentage: stats.bookings.percentage
      }
    ]

    const extraPoints = [
      { x: 5.5, y: 70, value: "", size: 12, color: COLORS.users, label: "Usuário", type: 'users' as const, percentage: 0 },
      { x: 7, y: 80, value: "", size: 10, color: COLORS.revenue, label: "Venda", type: 'revenue' as const, percentage: 0 },
      { x: 8.5, y: 75, value: "", size: 14, color: COLORS.barbershops, label: "Barbearia", type: 'barbershops' as const, percentage: 0 },
      { x: 10, y: 85, value: "", size: 11, color: COLORS.bookings, label: "Booking", type: 'bookings' as const, percentage: 0 },
    ]

    return [...data, ...extraPoints]
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
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
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    )
  }

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
              Últimos 7 dias • Atualizado {format(new Date(), "HH:mm", { locale: ptBR })}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white h-8 w-8"
            onClick={() => window.location.reload()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] lg:min-h-0">
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
              />
              
              <XAxis
                type="number"
                dataKey="x"
                domain={[4.5, 10.5]}
                ticks={[5, 6.5, 8, 9.5]}
                axisLine={false}
                tickLine={true}
                tickSize={25}
                strokeWidth={0.2}
                tickMargin={10}
                tickFormatter={(value) => {
                  const labels: Record<number, string> = {
                    5: 'Usuários',
                    6.5: 'Receita',
                    8: 'Barbearias',
                    9.5: 'Agendamentos'
                  }
                  return labels[value] || ''
                }}
                tick={({ x, y, payload }) => (
                  <text
                    x={x}
                    y={y - 15}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={10}
                  >
                    {payload.value}
                  </text>
                )}
              />
              
              <YAxis
                type="number"
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={true}
                tickSize={25}
                strokeWidth={0.2}
                tickFormatter={(value) => `${value}%`}
                tickMargin={10}
                tick={({ x, y, payload }) => (
                  <text
                    x={x + 15}
                    y={y + 20}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={9}
                  >
                    {payload.value}%
                  </text>
                )}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
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
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.users }} />
            <span className="text-xs sm:text-sm text-slate-400">Usuários</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.barbershops }} />
            <span className="text-xs sm:text-sm text-slate-400">Barbearias</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS.revenue }} />
            <span className="text-xs sm:text-sm text-slate-400">Receita</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}