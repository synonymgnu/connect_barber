"use client"

import { useEffect, useState, memo } from "react"
import { Calendar, CheckCircle, TrendingDown, TrendingUp, Users, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"

interface Metric {
  title: string
  value: string
  change: number
  percentage: string
  icon: React.ReactNode
  trend: "up" | "down"
  color: string
}

const MetricCard = memo(({ metric, index }: { metric: Metric; index: number }) => {
  const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
  const trendColor = metric.trend === "up" ? "text-green-500" : "text-red-500"

  return (
    <Card className="bg-[#15141b] border-[#1f1f1f] hover:bg-[#0c0c0c] transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          {metric.title}
        </CardTitle>
        <div className="text-slate-400">
          {metric.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
          {metric.value}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <div className="bg-slate-800 rounded-2xl p-2">
              <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            </div>
            <span className={`text-sm font-medium ${trendColor}`}>
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
          </div>
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#374151"
                strokeWidth="2"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={metric.trend === "up" ? metric.color : "#ef4444"}
                strokeWidth="2"
                strokeDasharray="100"
                strokeDashoffset={100 - parseInt(metric.percentage)}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white">
                {metric.percentage}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

MetricCard.displayName = 'MetricCard'

function AppointmentsMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/appointments/metrics')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar métricas')
        }
        
        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        const formattedMetrics: Metric[] = [
          {
            title: "Próximos agendamentos",
            value: data.metrics.upcoming.value,
            change: data.metrics.upcoming.change,
            percentage: "12%",
            icon: <Calendar className="h-4 w-4" />,
            trend: data.metrics.upcoming.trend,
            color: "#10b981"
          },
          {
            title: "Agendamentos concluídos",
            value: data.metrics.completed.value,
            change: data.metrics.completed.change,
            percentage: "11%",
            icon: <CheckCircle className="h-4 w-4" />,
            trend: data.metrics.completed.trend,
            color: "#B400E0"
          },
          {
            title: "Agendamentos cancelados",
            value: data.metrics.cancelled.value,
            change: data.metrics.cancelled.change,
            percentage: "15%",
            icon: <XCircle className="h-4 w-4" />,
            trend: "down",
            color: "#FF8E00"
          },
          {
            title: "Total de clientes",
            value: data.metrics.customers.value,
            change: data.metrics.customers.change,
            percentage: "35%",
            icon: <Users className="h-4 w-4" />,
            trend: data.metrics.customers.trend,
            color: "#008DD2"
          }
        ]

        setMetrics(formattedMetrics)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        console.error('Error fetching metrics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
    const interval = setInterval(fetchMetrics, 600000)
    
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#15141b] border-[#1f1f1f]">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-6 w-1/2 mb-4" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {['Próximos', 'Concluídos', 'Cancelados', 'Clientes'].map((title) => (
          <Card key={title} className="bg-[#15141b] border-[#1f1f1f]">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center h-32">
                <p className="text-red-500 text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <MetricCard key={index} metric={metric} index={index} />
      ))}
    </div>
  )
}

export default memo(AppointmentsMetrics)