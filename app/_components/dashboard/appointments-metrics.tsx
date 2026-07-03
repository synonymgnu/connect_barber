"use client"

import { memo } from "react"
import { Calendar, CheckCircle, TrendingDown, TrendingUp, Users, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { useDashboardMetrics } from "@/app/_hooks/use-dashboard-metrics"

interface Metric {
  title: string
  value: string
  change: number | null
  percentage: string
  icon: React.ReactNode
  trend: "up" | "down"
  color: string
  invertTrend?: boolean
}

const MetricCard = memo(({ metric, index }: { metric: Metric; index: number }) => {
  const isGood = metric.invertTrend ? metric.trend === "down" : metric.trend === "up"
  const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
  const trendColor = isGood ? "text-green-500" : "text-red-500"
  const noComparison = metric.change === null

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
              <TrendIcon className={`h-3 w-3 ${noComparison ? 'text-slate-400' : trendColor}`} />
            </div>
            <span className={`text-sm font-medium ${noComparison ? 'text-slate-400' : trendColor}`}>
              {noComparison ? 'Novo' : `${metric.change! > 0 ? '+' : ''}${metric.change}%`}
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
                stroke={isGood ? metric.color : "#ef4444"}
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
  const { data, isLoading: loading, error } = useDashboardMetrics()

  const metrics: Metric[] = data ? [
    {
      title: "Próximos agendamentos",
      value: data.metrics.upcoming.value,
      change: data.metrics.upcoming.change,
      percentage: data.metrics.upcoming.percentage,
      icon: <Calendar className="h-4 w-4" />,
      trend: data.metrics.upcoming.trend,
      color: "#10b981"
    },
    {
      title: "Agendamentos concluídos",
      value: data.metrics.completed.value,
      change: data.metrics.completed.change,
      percentage: data.metrics.completed.percentage,
      icon: <CheckCircle className="h-4 w-4" />,
      trend: data.metrics.completed.trend,
      color: "#B400E0"
    },
    {
      title: "Agendamentos cancelados",
      value: data.metrics.cancelled.value,
      change: data.metrics.cancelled.change,
      percentage: data.metrics.cancelled.percentage,
      icon: <XCircle className="h-4 w-4" />,
      trend: data.metrics.cancelled.trend,
      color: "#FF8E00",
      invertTrend: true
    },
    {
      title: "Total de clientes",
      value: data.metrics.customers.value,
      change: data.metrics.customers.change,
      percentage: data.metrics.customers.percentage,
      icon: <Users className="h-4 w-4" />,
      trend: data.metrics.customers.trend,
      color: "#008DD2"
    }
  ] : []

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
                <p className="text-red-500 text-sm">{error instanceof Error ? error.message : 'Erro ao carregar'}</p>
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