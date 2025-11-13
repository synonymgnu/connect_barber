import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Review {
  id: string
  value: number
  clientName: string
  clientImage?: string
  serviceName: string
  date: string
}

interface ReviewsChartProps {
  reviews: Review[]
}

export default function ReviewsChart({ reviews }: ReviewsChartProps) {
  const data = [
    { name: "5 estrelas", value: reviews.filter(r => r.value === 5).length, stars: 5 },
    { name: "4 estrelas", value: reviews.filter(r => r.value === 4).length, stars: 4 },
    { name: "3 estrelas", value: reviews.filter(r => r.value === 3).length, stars: 3 },
    { name: "2 estrelas", value: reviews.filter(r => r.value === 2).length, stars: 2 },
    { name: "1 estrela", value: reviews.filter(r => r.value === 1).length, stars: 1 },
  ]

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, r) => sum + r.value, 0) / totalReviews 
    : 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Star className="h-5 w-5 text-yellow-400" /> 
            Distribuição de Avaliações
            <span className="text-sm text-gray-400 ml-auto">
              Média: {averageRating.toFixed(1)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="name" 
                stroke="#888"
                fontSize={12}
              />
              <YAxis 
                stroke="#888"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1A1A', 
                  borderColor: '#333',
                  color: 'white'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#8161FF" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#333]">
        <CardHeader>
          <CardTitle className="text-white">Avaliações Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-[300px] overflow-y-auto">
          {reviews.slice(0, 5).map((review) => (
            <div key={review.id} className="space-y-2 p-3 bg-[#151515] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < review.value 
                            ? "text-yellow-400 fill-current" 
                            : "text-gray-600"
                        }`} 
                      />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {format(new Date(review.date), "dd/MM/yy", { locale: ptBR })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-white font-medium">
                  {review.clientName}
                </span>
                <span className="text-xs text-gray-400 bg-[#333] px-2 py-1 rounded">
                  {review.serviceName}
                </span>
              </div>
            </div>
          ))}
          {reviews.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma avaliação ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}