import Header from "../_components/header"
import AppointmentsMetrics from "../_components/dashboard/appointments-metrics"
import { Card, CardContent, CardHeader } from "../_components/ui/card"

const DashboardPage = () => {
    return (
        <div className="space-y-6">
            <Header />
            <div className="flex items-center justify-center">
                <h1 className="text-3xl font-bold">Dashboard</h1>
            </div>
            <section className="w-[80%] mx-auto">
                <Card>
                    <CardHeader>
                        <h2 className="text-2xl font-semibold mb-4">Appointments Overview</h2>
                    </CardHeader>
                    <CardContent>
                        <AppointmentsMetrics />
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default DashboardPage