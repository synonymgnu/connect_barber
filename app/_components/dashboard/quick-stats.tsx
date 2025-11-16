"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { ShoppingCart, User, DollarSign } from "lucide-react"

interface QuickStatsData {
  newOrders: number
  uniqueVisitors: number
  totalRevenue: number
}

export default function QuickStats() {
  const [data, setData] = useState<QuickStatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchQuickStats = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/quick-stats')
      if (!response.ok) throw new Error('Erro ao carregar dados')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro ao buscar estatísticas rápidas:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuickStats()
  }, [fetchQuickStats])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-[#0c0c0c] border-[#1f1f1f]">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      title: "New Orders",
      value: data.newOrders.toLocaleString('pt-BR'),
      icon: ShoppingCart,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20"
    },
    {
      title: "Visitantes Únicos",
      value: data.uniqueVisitors.toLocaleString('pt-BR'),
      icon: User,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20"
    },
    {
      title: "Receita Total",
      value: `R$ ${data.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/20"
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="bg-[#0c0c0c] border-[#1f1f1f]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-slate-400">{stat.title}</p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}