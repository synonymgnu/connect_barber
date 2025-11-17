// app/dashboard/reports/page.tsx
import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card"
import AuthCheck from "../../_components/auth-check"
import ReportsHeader from "../../_components/dashboard/reports-header"
import MonthlyEarningsChart from "../../_components/dashboard/monthly-earnings-chart"
import QuickStats from "../../_components/dashboard/quick-stats"
import PerformanceChart from "../../_components/dashboard/performance-chart"
import ServicesChart from "../../_components/dashboard/services-chart"
import TopBarbers from "../../_components/dashboard/top-barbers"
import { ReportsProvider } from "../../_components/dashboard/reports-context"

// loading skeleton
function ReportsSkeleton() {
  return (
    <div className="space-y-6">
      <ReportsHeader />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="h-[120px]">
            <CardContent className="p-6">
              <div className="h-4 w-24 bg-muted rounded mb-3" />
              <div className="h-8 w-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="h-[400px]">
        <CardContent className="p-6">
          <div className="h-6 w-48 bg-muted rounded mb-4" />
          <div className="h-[300px] w-full bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  )
}

const ReportsPage = () => {
  return (
    <AuthCheck requiredRole="ADMIN">
      <ReportsProvider>
        <div className="min-h-screen bg-background">
          <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <Suspense fallback={<ReportsSkeleton />}>
              <ReportsHeader />
              
              <div className="grid grid-cols-1 gap-6">
                <QuickStats />
                
                <Card>
                  <CardHeader>
                    <CardTitle>Ganhos do Mês</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MonthlyEarningsChart />
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  <div className="lg:col-span-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Desempenho de Receita</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PerformanceChart />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="lg:col-span-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Serviços Mais Solicitados</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ServicesChart />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Barbeiros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <TopBarbers />
                  </CardContent>
                </Card>
              </div>
            </Suspense>
          </main>
        </div>
      </ReportsProvider>
    </AuthCheck>
  )
}

export default ReportsPage