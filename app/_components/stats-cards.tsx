import { Calendar, CheckCircle, DollarSign, Star, XCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"

export default function StatsCards({ stats, className }: { stats: any, className?: string }) {
  const cards = [
    { 
      title: "Total", 
      fullTitle: "Total de Atendimentos",
      value: stats.total, 
      icon: Calendar, 
      color: "text-[#8161FF]", 
      bg: "bg-[#151515]",
      border: "border-l-4 border-[#8161FF]"
    },
    { 
      title: "Concluídos", 
      fullTitle: "Concluídos",
      value: stats.completed, 
      icon: CheckCircle, 
      color: "text-green-400", 
      bg: "bg-[#151515]",
      border: "border-l-4 border-green-400"
    },
    { 
      title: "Cancelados", 
      fullTitle: "Cancelados",
      value: stats.cancelled, 
      icon: XCircle, 
      color: "text-red-400", 
      bg: "bg-[#151515]",
      border: "border-l-4 border-red-400"
    },
    { 
      title: "Avaliação", 
      fullTitle: "Avaliação Média",
      value: stats.avgRating?.toFixed(1) || '0.0', 
      icon: Star, 
      color: "text-yellow-400", 
      bg: "bg-[#151515]",
      border: "border-l-4 border-yellow-400"
    },
    { 
      title: "Receita", 
      fullTitle: "Receita Total",
      value: `R$ ${stats.revenue?.toFixed(2) || '0.00'}`, 
      icon: DollarSign, 
      color: "text-[#8161FF]", 
      bg: "bg-[#151515]",
      border: "border-l-4 border-[#8161FF]"
    },
  ]

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-5 md:grid-cols-3 gap-3 sm:gap-4 ${className || ''}`}>
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <Card 
            key={index} 
            className={`${card.bg} ${card.border} border-[#333] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
              <CardTitle className="text-xs sm:text-sm font-semibold text-gray-300">
                <span className="hidden sm:inline">{card.fullTitle}</span>
                <span className="sm:hidden">{card.title}</span>
              </CardTitle>
              <div className={`p-1 sm:p-2 rounded-lg bg-[#1A1A1A]`}>
                 <Icon className={`h-3 w-3 sm:h-4 sm:w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-white">{card.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}