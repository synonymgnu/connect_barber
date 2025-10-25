import Header from "../_components/header"
import AppointmentsMetrics from "../_components/dashboard/appointments-metrics"
import { Card, CardContent, CardHeader } from "../_components/ui/card"
import RecentStatsSection from "../_components/dashboard/recent-stats-section"
import AppointmentStatsSection from "../_components/dashboard/appointment-stats-section"

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <Header />
            <div className="flex items-center justify-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <main>
                <section className="w-[80%] mx-auto">
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold mb-4">Appointments Overview</h2>
                    </CardHeader>
                    <CardContent>
                        <AppointmentsMetrics />
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8">
                            <div className="lg:col-span-8">
                                <AppointmentStatsSection />
                            </div>
                            <div className="lg:col-span-4">
                                <RecentStatsSection />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>
            </main>
        </div>
    )
}

export default DashboardPage