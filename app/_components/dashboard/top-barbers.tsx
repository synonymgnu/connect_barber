"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Skeleton } from "../ui/skeleton"
import { Avatar, AvatarImage } from "../ui/avatar"
import { Medal } from "lucide-react"

interface BarberData {
  id: string
  name: string
  imageUrl?: string
  appointments: number
  revenue: number
  hoursWorked: number
}

export default function TopBarbers() {
  const [data, setData] = useState<BarberData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTopBarbers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/reports/top-barbers')
      if (!response.ok) throw new Error('Erro ao carregar dados')
      
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Erro ao buscar top barbeiros:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopBarbers()
  }, [fetchTopBarbers])

  if (loading) {
    return (
      <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full mb-2" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const getMedalColor = (index: number) => {
    if (index === 0) return "text-yellow-400"
    if (index === 1) return "text-gray-400"
    if (index === 2) return "text-orange-600"
    return "text-slate-500"
  }

  return (
    <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
      <CardHeader>
        <CardTitle className="text-white">Top Barbeiros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map((barber, index) => (
          <div key={barber.id} className="flex items-center justify-between p-3 rounded-lg bg-[#0f0f0f] border border-[#1f1f1f] hover:border-[#8161FF]/30 transition">
            <div className="flex items-center gap-3">
              <Medal className={`h-6 w-6 ${getMedalColor(index)}`} />
              <Avatar className="w-10 h-10">
                <AvatarImage src={barber.imageUrl || '/user-img.svg'} />
              </Avatar>
              <div>
                <p className="font-medium text-white">{barber.name}</p>
                <p className="text-xs text-slate-500">{barber.appointments} agendamentos</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-semibold">
                R$ {barber.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-slate-500">{barber.hoursWorked}h trabalhadas</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}