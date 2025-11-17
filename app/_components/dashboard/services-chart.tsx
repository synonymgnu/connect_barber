"use client"

import { useState, useEffect, useCallback } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Skeleton } from "../ui/skeleton"
import { CardContent } from "../ui/card"

const COLORS = [
  'hsl(var(--primary))',
  '#a78bfa',
  '#c4b5fd',
  'hsl(var(--warning))',
  'hsl(var(--success))',
  '#8b5cf6'
]

interface ServiceData {
  name: string
  value: number
  percentage?: number
  [key: string]: any
}

const renderLabel = (props: any) => {
  const { x, y, name, percent, textAnchor } = props
  const percentage = (percent * 100).toFixed(0)
  
  const truncatedName = name.length > 12 ? `${name.substring(0, 12)}...` : name
  
  return (
    <text 
      x={x} 
      y={y} 
      textAnchor={textAnchor} 
      dominantBaseline="central"
      className="fill-white text-xs font-medium"
    >
      <tspan x={x} dy="-0.4em">{truncatedName}</tspan>
      <tspan x={x} dy="1.2em" className="fill-slate-400">{percentage}%</tspan>
    </text>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-md border bg-popover p-3 text-popover-foreground shadow-md">
        <p className="font-medium">{data.name}</p>
        <p className="text-sm text-muted-foreground">
          {data.value} agendamentos • {data.percentage}%
        </p>
      </div>
    )
  }
  return null
}

export default function ServicesChart() {
  const [data, setData] = useState<ServiceData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchServicesData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/reports/services')
      if (!response.ok) throw new Error('Erro ao carregar dados')
      
      const result = await response.json()
      
      const total = result.reduce((sum: number, item: ServiceData) => sum + item.value, 0)
      const withPercentages = result.map((item: ServiceData) => ({
        ...item,
        percentage: ((item.value / total) * 100).toFixed(1)
      }))
      
      setData(withPercentages)
    } catch (err) {
      console.error('Erro ao buscar serviços:', err)
      setError('Não foi possível carregar os dados')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchServicesData()
  }, [fetchServicesData])

  if (loading) {
    return <Skeleton className="h-[300px] w-full rounded-lg" />
  }

  if (error) {
    return (
      <CardContent className="flex h-[300px] items-center justify-center">
        <p className="text-sm text-muted-foreground">{error}</p>
      </CardContent>
    )
  }

  if (data.length === 0) {
    return (
      <CardContent className="flex h-[300px] flex-col items-center justify-center gap-2">
        <p className="text-sm text-muted-foreground">Nenhum serviço encontrado</p>
        <p className="text-xs text-muted-foreground/60">Complete agendamentos para ver dados</p>
      </CardContent>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          label={renderLabel}
          labelLine={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
          outerRadius={90}
          fill="hsl(var(--primary))"
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  )
}