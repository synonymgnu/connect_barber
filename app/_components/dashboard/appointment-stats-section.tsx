"use client"

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Brush } from "recharts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useMemo, useState, memo } from "react";
import { useAppointmentStats } from "@/app/_hooks/use-dashboard-metrics";

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

const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const offlineValue = payload.find((p: any) => p.dataKey === 'offline')?.value || 0;
    const onlineValue = Math.abs(payload.find((p: any) => p.dataKey === 'online')?.value || 0);
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
});

CustomTooltip.displayName = 'CustomTooltip';

function AppointmentStatsSection({ className }: AppointmentStatsSectionProps) {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');
  const { data: stats, isLoading: loading, error } = useAppointmentStats(timeRange);

  // gráfico divergente
  const chartData = useMemo(() => {
    if (!stats) return [];
    return stats.chartData.map((item: AppointmentStatsData) => ({
      time: item.time,
      offline: item.offline,
      online: -item.online,
    }));
  }, [stats]);



  if (loading) {
    return (
      <Card className={`w-full bg-[#0c0c0c] border-[#1f1f1f] ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Estatísticas de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded w-48 mb-4"></div>
              <div className="h-64 bg-slate-700 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !stats) {
    return (
      <Card className={`w-full bg-[#0c0c0c] border-[#1f1f1f] ${className}`}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">
            Estatísticas de Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-rose-400">{error instanceof Error ? error.message : 'Erro ao carregar dados'}</div>
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
                    ? "bg-[#8161FF] text-white border-[#8161FF]"
                    : "text-slate-400 border-slate-700 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                {period === '1D' ? 'Dia' : 
                 period === '1W' ? 'Semana' : 
                 period === '1M' ? 'Mês' : 'Ano'}
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
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
                domain={['dataMin - 20', 'dataMax + 20']}
                tickFormatter={(value) => Math.abs(value).toString()}
                width={40}
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
                maxBarSize={20}
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
                maxBarSize={20}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`offline-${index}`} fill="#8b5cf6" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-[#1f1f1f]">
          <div className="text-center">
            <p className="text-slate-400 text-xs">Total</p>
            <p className="text-white font-semibold text-lg">{stats.totalAppointments}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">Novos Clientes</p>
            <p className="text-white font-semibold text-lg">{stats.newCustomers}</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">Taxa Conversão</p>
            <p className="text-white font-semibold text-lg">{stats.conversionRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">
              Pico ({timeRange === '1D' ? 'Hora' : timeRange === '1W' ? 'Dia' : timeRange === '1M' ? 'Dia' : 'Mês'})
            </p>
            <p className="text-white font-semibold text-lg">
              {stats.peakHour === 'N/A' ? '-' : stats.peakHour}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(AppointmentStatsSection)