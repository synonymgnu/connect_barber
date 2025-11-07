"use client"

import { Calendar, CheckCircle, TrendingDown, TrendingUp, Users, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";

interface AppointmentsMetricsProps {
    title: string;
    value: string;
    change: number;
    percentage: string;
    icon: React.ReactNode;
    trend: "up" | "down";
    color: string;
}

interface MetricsData {
    metrics: {
        upcoming: {
            value: string;
            change: number;
            percentage: string;
            trend: "up" | "down";
        };
        completed: {
            value: string;
            change: number;
            percentage: string;
            trend: "up" | "down";
        };
        cancelled: {
            value: string;
            change: number;
            percentage: string;
            trend: "up" | "down";
        };
        customers: {
            value: string;
            change: number;
            percentage: string;
            trend: "up" | "down";
        };
    };
    totalAppointments: number;
}

export function AppointmentsMetrics() {
    const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/appointments/metrics');
                
                if (!response.ok) {
                    throw new Error('Erro ao carregar métricas');
                }
                
                const data = await response.json();
                setMetricsData(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro desconhecido');
                console.error('Error fetching metrics:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    // Dados mockados para fallback
    const mockMetrics: AppointmentsMetricsProps[] = [
        {
            title: "Próximos agendamentos",
            value: "150",
            change: 1.3,
            percentage: "12%",
            icon: <Calendar className="h-4 w-4" />,
            trend: "up",
            color: "#10b981"
        },
        {
            title: "Agendamentos concluídos",
            value: "80",
            change: 1.2,
            percentage: "11%",
            icon: <CheckCircle className="h-4 w-4" />,
            trend: "up",
            color: "#B400E0"
        },
        {
            title: "Agendamentos cancelados",
            value: "50",
            change: 0.5,
            percentage: "15%",
            icon: <XCircle className="h-4 w-4" />,
            trend: "up",
            color: "#FF8E00"
        },
        {
            title: "Total de clientes",
            value: "580",
            change: 2.5,
            percentage: "35%",
            icon: <Users className="h-4 w-4" />,
            trend: "up",
            color: "#008DD2"
        }
    ];

    // dados reais se disponíveis senão mock
    const metrics = metricsData ? [
        {
            title: "Próximos agendamentos",
            value: metricsData.metrics.upcoming.value,
            change: metricsData.metrics.upcoming.change,
            percentage: metricsData.metrics.upcoming.percentage,
            icon: <Calendar className="h-4 w-4" />,
            trend: metricsData.metrics.upcoming.trend,
            color: "#10b981"
        },
        {
            title: "Agendamentos concluídos",
            value: metricsData.metrics.completed.value,
            change: metricsData.metrics.completed.change,
            percentage: metricsData.metrics.completed.percentage,
            icon: <CheckCircle className="h-4 w-4" />,
            trend: metricsData.metrics.completed.trend,
            color: "#B400E0"
        },
        {
            title: "Agendamentos cancelados",
            value: metricsData.metrics.cancelled.value,
            change: metricsData.metrics.cancelled.change,
            percentage: metricsData.metrics.cancelled.percentage,
            icon: <XCircle className="h-4 w-4" />,
            trend: metricsData.metrics.cancelled.trend,
            color: "#FF8E00"
        },
        {
            title: "Total de clientes",
            value: metricsData.metrics.customers.value,
            change: metricsData.metrics.customers.change,
            percentage: metricsData.metrics.customers.percentage,
            icon: <Users className="h-4 w-4" />,
            trend: metricsData.metrics.customers.trend,
            color: "#008DD2"
        }
    ] : mockMetrics;

    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="relative overflow-hidden">
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-slate-700 rounded w-1/2 mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-6 bg-slate-700 rounded w-1/3"></div>
                                    <div className="h-12 bg-slate-700  w-12 rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 min-w-max">
                    {metrics.map((metric, index) => (
                        <AppointmentMetricCard key={index} metric={metric} />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        <Card className="relative overflow-hidden bg-[#15141b] hover:bg-[#0c0c0c] transition-colors border-[#1f1f1f]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm lg:text-base font-medium truncate text-white">
                    {metric.title}
                </CardTitle>
                <div className="text-slate-400">
                    {metric.icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                    {metric.value}
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-end justify-between space-y-1 w-full">
                        <div className="flex items-center space-x-1 gap-2">
                            <div className="bg-slate-800 rounded-2xl p-2">
                                <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                            </div>
                            <span className={`text-sm font-medium ${trendColor}`}>
                                {metric.change > 0 ? '+' : ''}{metric.change}%
                            </span>
                        </div>
                
                        {/* Barra de progresso circular */}
                        <div className="flex relative w-12 h-12">
                            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">

                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke="#374151"
                                    strokeWidth="2"
                                />

                                {/* Progresso */}
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    stroke={metric.trend === "up" ? metric.color : "#ef4444"}
                                    strokeWidth="2"
                                    strokeDasharray="100"
                                    strokeDashoffset={100 - parseInt(metric.percentage)}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white">
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

export default AppointmentsMetrics;