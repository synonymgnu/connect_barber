import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card"
import AuthCheck from "../../_components/auth-check"
import ReportsHeader from "../../_components/dashboard/reports-header"
import MonthlyEarningsChart from "../../_components/dashboard/monthly-earnings-chart"
import QuickStats from "../../_components/dashboard/quick-stats"
import PerformanceChart from "../../_components/dashboard/performance-chart"
import ServicesChart from "../../_components/dashboard/services-chart"
import TopBarbers from "../../_components/dashboard/top-barbers"

const ReportsPage = () => {
    return (
        <AuthCheck requiredRole="ADMIN">
            <div className="min-h-screen bg-background overflow-x-hidden">
                <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
                    
                    {/* Card Principal */}
                    <Card className="w-full border-[#1f1f1f]">
                        <CardContent className="p-6 space-y-6">
                            
                            {/* Header com Relatórios + Calendário */}
                            <ReportsHeader />
                            
                            {/* Gráfico de Ganhos (70% width) */}
                            <MonthlyEarningsChart />
                            
                            {/* Cards abaixo do gráfico */}
                            <QuickStats />

                            {/* Desempenho e Serviços */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                <div className="lg:col-span-8">
                                    <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
                                        <CardHeader>
                                            <CardTitle className="text-white">Desempenho de Receita</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <PerformanceChart />
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="lg:col-span-4">
                                    <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
                                        <CardHeader>
                                            <CardTitle className="text-white">Serviços Mais Solicitados</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ServicesChart />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            {/* Top Barbeiros Simplificado */}
                            <TopBarbers />
                                    
                        </CardContent>
                    </Card>                    

                </main>
            </div> 
        </AuthCheck>
    )
}

export default ReportsPage