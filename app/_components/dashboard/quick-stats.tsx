"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { ShoppingCart, User, DollarSign } from "lucide-react"
import { Button } from "../ui/button"

interface QuickStatsData {
  newOrders: number
  uniqueVisitors: number
  totalRevenue: number
}

async function fetchQuickStats(): Promise<QuickStatsData> {
  const response = await fetch('/api/reports/quick-stats')
  if (!response.ok) throw new Error('Erro ao carregar dados')
  return response.json()
}

export default function QuickStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports', 'quick-stats'],
    queryFn: fetchQuickStats,
    staleTime: 60 * 1000,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[120px]">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-3" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Erro ao carregar estatísticas</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    )
  }

  if (!data) return null

  const stats = [
    {
      title: "Novos Pedidos",
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
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}