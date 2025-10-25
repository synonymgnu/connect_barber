import { Calendar, CheckCircle, TrendingDown, TrendingUp, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface AppointmentsMetricsProps {
    title: string;
    value: string;
    change: number;
    percentage: string;
    icon: React.ReactNode;
    trend: "up" | "down";
    color: string;
}

export function AppointmentsMetrics() {
    const metrics: AppointmentsMetricsProps[] = [
        {
            title: "Upcoming Appointments",
            value: "150",
            change: 1.3,
            percentage: "12%",
            icon: <Calendar className="h-4 w-4" />,
            trend: "up",
            color: "#10b981"
        },
        {
            title: "Pass Appointment",
            value: "80",
            change: 1.2,
            percentage: "11%",
            icon: <CheckCircle className="h-4 w-4" />,
            trend: "up",
            color: "#B400E0"
        },
        {
            title: "Cancel Appointment",
            value: "50",
            change: 0.5,
            percentage: "15%",
            icon: <XCircle className="h-4 w-4" />,
            trend: "up",
            color: "#FF8E00"
        },
        {
            title: "Total Customer",
            value: "580",
            change: 2.5,
            percentage: "35%",
            icon: <Users className="h-4 w-4" />,
            trend: "up",
            color: "#008DD2"
        }
    ];

    return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <AppointmentMetricCard key={index} metric={metric} />
      ))}
    </div>
  );
}

interface AppointmentMetricCardProps {
  metric: AppointmentsMetricsProps;
}

function AppointmentMetricCard({ metric }: AppointmentMetricCardProps) {
    const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown;
    const trendColor = metric.trend === "up" ? "text-green-500" : "text-red-500";
   
    return ( 
    <Card className="relative overflow-hidden hover:bg-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium truncate lg:text-lg">{metric.title}</CardTitle>
            <div className="text-muted-foreground">
                {metric.icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold">
                {metric.value}
            </div>
            <div className="flex items-center justify-between">
 
                {/* gráfico de porcentagem */}
                <div className="flex items-end justify-between space-y-1 w-full">
                    <div className="flex items-center space-x-1 gap-2">
                        <div className="bg-green-950 rounded-2xl p-2">
                            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        </div>
                        <span className={`text-sm font-medium ${trendColor}`}>
                            {metric.change}%
                        </span>
                    </div>
            
                    {/* Barra de progresso */}
                    <div className="flex relative w-12 h-12">
                        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            {/* Fundo do círculo */}
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                            />
                            {/* Progresso */}
                            <circle
                                cx="18"
                                cy="18"
                                r="16"
                                fill="none"
                                stroke={metric.trend === "up" ? metric.color : "#FF1E0C"}
                                strokeWidth="2"
                                strokeDasharray="100"
                                strokeDashoffset={100 - parseInt(metric.percentage)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-foreground">
                                {metric.percentage}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
    );
}    

export default AppointmentsMetrics