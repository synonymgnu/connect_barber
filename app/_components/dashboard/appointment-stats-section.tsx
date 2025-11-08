"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Brush } from "recharts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useMemo, useState } from "react";

interface AppointmentStatsData {
  time: string;
  offline: number;
  online: number;
}

interface AppointmentStats {
  totalAppointments: number;
  newCustomers: number;
  offlineCount: number;
  onlineCount: number;
  conversionRate: number;
  peakHour: string;
  chartData: AppointmentStatsData[];
}

interface AppointmentStatsSectionProps {
  className?: string;
}

async function fetchAppointmentStats(timeRange: '1D' | '1W' | '1M' | '1Y') {
    try {
        const response = await fetch(`/api/appointments/stats?range=${timeRange}`);
        if (!response.ok) throw new Error('Erro ao buscar estatísticas');
        return response.json();
    } catch (error) {
        console.error('Error fetching stats:', error);

        return generateMockData(timeRange);
    }
}

// Função para simular dados enquanto não tem a API
function generateMockData(timeRange: '1D' | '1W' | '1M' | '1Y'): AppointmentStats {
  const baseData = {
    '1D': {
      totalAppointments: 150,
      newCustomers: 45,
      offlineCount: 85,
      onlineCount: 65,
      conversionRate: 68,
      peakHour: "10:00 AM",
      chartData: [
        { time: "8:00 AM", offline: 45, online: 20 },
        { time: "9:00 AM", offline: 60, online: 35 },
        { time: "10:00 AM", offline: 80, online: 50 },
        { time: "11:00 AM", offline: 70, online: 45 },
        { time: "12:00 PM", offline: 50, online: 30 },
        { time: "2:00 PM", offline: 40, online: 25 },
        { time: "3:00 PM", offline: 55, online: 35 },
        { time: "4:00 PM", offline: 35, online: 20 },
        { time: "5:00 PM", offline: 25, online: 15 },
        { time: "6:00 PM", offline: 30, online: 20 },
        { time: "7:00 PM", offline: 20, online: 10 },
      ]
    },
    '1W': {
      totalAppointments: 890,
      newCustomers: 210,
      offlineCount: 520,
      onlineCount: 370,
      conversionRate: 72,
      peakHour: "Sábado",
      chartData: [
        { time: "Seg", offline: 120, online: 80 },
        { time: "Ter", offline: 150, online: 95 },
        { time: "Qua", offline: 130, online: 85 },
        { time: "Qui", offline: 140, online: 90 },
        { time: "Sex", offline: 160, online: 110 },
        { time: "Sáb", offline: 180, online: 130 },
      ]
    },
    '1M': {
      totalAppointments: 3500,
      newCustomers: 850,
      offlineCount: 2100,
      onlineCount: 1400,
      conversionRate: 75,
      peakHour: "Semana 2",
      chartData: [
        { time: "Sem 1", offline: 450, online: 300 },
        { time: "Sem 2", offline: 520, online: 350 },
        { time: "Sem 3", offline: 480, online: 320 },
        { time: "Sem 4", offline: 510, online: 340 },
      ]
    },
    '1Y': {
      totalAppointments: 42000,
      newCustomers: 9800,
      offlineCount: 25200,
      onlineCount: 16800,
      conversionRate: 78,
      peakHour: "Maio",
      chartData: [
        { time: "Jan", offline: 1800, online: 1200 },
        { time: "Fev", offline: 1900, online: 1300 },
        { time: "Mar", offline: 2100, online: 1400 },
        { time: "Abr", offline: 2000, online: 1350 },
        { time: "Mai", offline: 2200, online: 1500 },
        { time: "Jun", offline: 2300, online: 1600 },
      ]
    }
  };

  return baseData[timeRange];
}

export default function AppointmentStatsSection({ className }: AppointmentStatsSectionProps) {

  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [stats, setStats] = useState<AppointmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // TODO: Substituir quando a API pronta
        const data = generateMockData(timeRange);
        setStats(data);
      } catch (error) {
        setError('Erro ao carregar estatísticas');
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [timeRange]);

  // gráfico divergente
  const chartData = useMemo(() => {
    if (!stats) return [];
    
    return stats.chartData.map(item => ({
      time: item.time,
      offline: item.offline,
      online: -item.online,
    }));
  }, [stats]);

  interface TooltipPayload {
    dataKey: string;
    value: number;
  }

  interface TooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
  }

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const offlineValue = payload.find((p) => p.dataKey === 'offline')?.value || 0;
      const onlineValue = Math.abs(payload.find((p) => p.dataKey === 'online')?.value || 0);
      
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold text-sm">{label}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span className="text-white text-sm">Offline: {offlineValue}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-3 h-3 bg-orange-500 rounded-full" />
            <span className="text-white text-sm">Online: {onlineValue}</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#2a2a2a]">
            <span className="text-emerald-400 text-sm font-semibold">
              Total: {offlineValue + onlineValue}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={`w-full bg-[#0c0c0c] border-[#1f1f1f] ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Carregando estatísticas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={`w-full bg-[#0c0c0c] border-[#1f1f1f] ${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-rose-400">{error || 'Erro ao carregar dados'}</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`w-full bg-[#0c0c0c] border-[#1f1f1f] ${className}`}>
      <CardHeader className="flex flex-col lg:flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold text-white">
          Estatísticas de Agendamentos
        </CardTitle>
        
        <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center lg:justify-end gap-2 lg:gap-4 mt-2 lg:mt-0">

          {/* Legendas */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm text-slate-400">Presencial</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full" />
              <span className="text-sm text-slate-400">Online</span>
            </div>
          </div>

          {/* Filtros de tempo */}
          <div className="flex items-center gap-1">
            {(['1D', '1W', '1M', '1Y'] as const).map((period) => (
              <Button
                key={period}
                variant="outline"
                size="sm"
                onClick={() => setTimeRange(period)}
                className={`h-8 px-3 text-xs ${
                  timeRange === period
                    ? "text-white"
                    : "text-slate-400 border-slate-700 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative flex-1 pt-0">
        
        <div className="h-72 mb-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 41, left: 41, bottom: 0 }}
              barGap={0}
              barCategoryGap="15%"
              stackOffset="sign"
            >
              <CartesianGrid
                stroke="#2a2a2a" 
                horizontal={true}
                vertical={false}
              />
              
              <XAxis 
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 8 }}
              />
              
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 8 }}
                domain={['dataMin - 20', 'dataMax + 20']}
                tickFormatter={(value) => Math.abs(value).toString()}
                width={20}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Brush
                dataKey="time"
                height={20}
                stroke="#2a2a2a"
                fill="#0f0f0f"
                travellerWidth={8}
                startIndex={0}
                endIndex={Math.min(4, chartData.length - 1)}
              />
              
              <Bar 
                dataKey="online" 
                fill="#f97316"
                radius={[12, 12, 12, 12]}
                stackId="stack"
                maxBarSize={14}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`online-${index}`} fill="#f97316" />
                ))}
              </Bar>
              
              <Bar 
                dataKey="offline" 
                fill="#8b5cf6"
                radius={[12, 12, 12, 12]}
                stackId="stack"
                maxBarSize={14}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`offline-${index}`} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}