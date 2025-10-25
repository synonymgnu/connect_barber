"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useState } from "react";

export default function AppointmentStatsSection() {
  
  const data = [
    { time: "8:00 AM", online: -25, offline: 20 },
    { time: "9:00 AM", online: -30, offline: 35 },
    { time: "10:00 AM", online: -35, offline: 25 },
    { time: "11:00 AM", online: -20, offline: 15 },
    { time: "12:00 PM", online: -30, offline: 28 },
    { time: "2:00 PM", online: -25, offline: 22 },
    { time: "3:00 PM", online: -35, offline: 20 },
    { time: "4:00 PM", online: -40, offline: 30 },
  ]

  const [isClicked, setIsClicked] = useState(false);

  function handleClick() {
    setIsClicked(!isClicked);
  }

  return (
    <Card className="w-full bg-[#0c0c0c] h-[70vh] sm:h-[50vh] overflow-x-auto">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-xl font-semibold">Appointment Stats</CardTitle>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2">

              <div className="h-3 w-3 ml-3 rounded-full bg-purple-500"></div>
              <span className="text-sm font-medium">Offline</span>

            </div>
            
            <div className="flex items-center gap-2">

              <div className="h-3 w-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium">Online</span>

            </div>
            <div className="flex items-center gap-2 ml-4">
              <Button variant="ghost" className="bg-purple-500 text-white hover:bg-purple-600">
                1D
              </Button>
              <Button variant="ghost" size="sm" className={`h-8 px-3 ${isClicked ? "bg-purple-500 text-cyan-400" : ""}`} onClick={handleClick}>
                1W
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                1M
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-3">
                1Y
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-w-[700px] h-fit">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
              tickFormatter={(value) => Math.abs(value).toString()}
              domain={[-50, 50]}
              ticks={[-50, -25, 0, 25, 50]}
            />

            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: 'none',
                borderRadius: '8px',
                color: 'white'
              }}
              cursor={{ fill: '#442f55' }}
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