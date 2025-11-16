"use client"

import { useState, useEffect, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface MonthlyData {
  day: string
  revenue: number
  appointments: number
}

export default function MonthlyEarningsChart() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })

  const fetchMonthlyData = useCallback(async () => {
    try {
      setLoading(true)
      const [year, month] = monthYear.split('-')
      const response = await fetch(`/api/reports/monthly?year=${year}&month=${month}`)
      if (!response.ok) throw new Error('Erro ao carregar dados')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro ao buscar ganhos mensais:', error)
    } finally {
      setLoading(false)
    }
  }, [monthYear])

  useEffect(() => {
    fetchMonthlyData()
  }, [fetchMonthlyData])

  if (loading) {
    return <Skeleton className="h-[400px] w-full rounded-lg" />
  }

  return (
    <div className="space-y-4">
      <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle className="text-white">Ganhos do Mês</CardTitle>
          <Select value={monthYear} onValueChange={setMonthYear}>
            <SelectTrigger className="w-[180px] bg-[#0f0f0f] border-[#1f1f1f] text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#0c0c0c] border-[#1f1f1f]">
              {/* Gerar últimos 12 meses */}
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date()
                date.setMonth(date.getMonth() - i)
                const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
                return <SelectItem key={value} value={value} className="text-white">{label}</SelectItem>
              })}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0c0c0c', 
                    border: '1px solid #1f1f1f',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: any) => [
                    `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    'Receita'
                  ]}
                />
                <Bar dataKey="revenue" fill="#8161FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}