"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";

export default function AppointmentStatsSection() {
  
  const data = [
    { time: "8:00", online: -25, offline: 20 },
    { time: "9:00", online: -30, offline: 35 },
    { time: "10:00", online: -35, offline: 25 },
    { time: "11:00", online: -20, offline: 15 },
    { time: "12:00", online: -30, offline: 28 },
    { time: "14:00", online: -25, offline: 22 },
    { time: "15:00", online: -35, offline: 20 },
    { time: "16:00", online: -40, offline: 30 },
  ]

  const [selectedPeriod, setSelectedPeriod] = useState("1D");

  const periods = ["1D", "1W", "1M", "1Y"];

  return (
    <Card className="w-full h-full bg-[#0c0c0c] border-[#1f1f1f]">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="space-y-4">
          <CardTitle className="text-lg sm:text-xl font-semibold text-white">
            Appointment Stats
          </CardTitle>

          <div className="flex justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300">Offline</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                  <span className="text-xs sm:text-sm font-medium text-slate-300">Online</span>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-center gap-1 sm:gap-2">
              {periods.map((period) => (
                  <Button
                    key={period}
                    variant="ghost"
                    size="sm"
                    className={`h-7 sm:h-8 px-2 sm:px-3 text-xs sm:text-sm ${
                      selectedPeriod === period
                        ? "bg-purple-500 text-white hover:bg-purple-600"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </Button>
                ))}
            </div>
          </div>
          
        </div>
      </CardHeader>
      <CardContent className="pt-2 px-4 sm:px-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 20, left: -20, bottom: 5 }}
            barGap={0}
            barCategoryGap="42%"
            stackOffset="sign"
          >
            <CartesianGrid strokeOpacity={0.2} stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[-50, 50]}
              ticks={[-50, -33, -17, 0, 17, 33, 50]}
              tickFormatter={(value) => {
                const map: Record<number, string> = {
                  50: "25-50",
                  33: "10-25",
                  17: "0-10",
                  0: "00-00",
                  [-17]: "0-10",
                  [-33]: "10-25",
                  [-50]: "25-50",
                };
                return map[Number(value)] || "";
              }}
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
              cursor={{ fill: '#442f55' }}
              formatter={(value, name) => [Math.abs(Number(value)), name]}
            />

            <Bar 
              dataKey="offline" 
              fill="#8b5cf6" 
              radius={[18, 18, 18, 18]}
              maxBarSize={30}
              stackId="appointments"
            />
            <Bar 
              dataKey="online" 
              fill="#f97316" 
              radius={[28, 28, 28, 28]}
              maxBarSize={30}
              stackId="appointments"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}