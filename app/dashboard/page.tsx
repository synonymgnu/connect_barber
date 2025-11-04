import Header from "../_components/header"
import AppointmentsMetrics from "../_components/dashboard/appointments-metrics"
import { Card, CardContent, CardHeader } from "../_components/ui/card"
import RecentStatsSection from "../_components/dashboard/recent-stats-section"
import AppointmentStatsSection from "../_components/dashboard/appointment-stats-section"
import AppointmentActivitySection from "../_components/dashboard/appointment-activity-section"

const DashboardPage = () => {
    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                <div className="flex items-center justify-center">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Dashboard</h1>
                </div>

                    <Card className="w-full">
                        <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
                            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                                Appointments Overview
                            </h2>
                        </CardHeader>
                        <CardContent className="px-4 sm:px-6 space-y-6">
                            <AppointmentsMetrics />

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
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

            </main>
        </div>         
    )
}

export default DashboardPage