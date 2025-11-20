import AppointmentsMetrics from "../_components/dashboard/appointments-metrics"
import { Card, CardContent, CardHeader } from "../_components/ui/card"
import RecentStatsSection from "../_components/dashboard/recent-stats-section"
import AppointmentStatsSection from "../_components/dashboard/appointment-stats-section"
import AppointmentActivitySection from "../_components/dashboard/appointment-activity-section"
import AuthCheck from "../_components/auth-check"

const DashboardPage = () => {
    return (
        <AuthCheck requiredRole="ADMIN">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-xl font-semibold">
                            Visão geral dos agendamentos
                        </h2>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <AppointmentsMetrics />
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8">
                                <AppointmentStatsSection />
                            </div>
                            <div className="lg:col-span-4">
                                <RecentStatsSection />
                            </div>
                        </div>
                        
                        <AppointmentActivitySection />
                    </CardContent>
                </Card>
            </div>
        </AuthCheck>
    )
}

export default DashboardPage
