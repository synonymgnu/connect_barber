"use client"

import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from "recharts";

interface DataPoint {
  x: number;
  y: number;
  value: string;
  size: number;
  color: string;
  label: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DataPoint }>;
}

interface CustomShapeProps {
  cx: number;
  cy: number;
  payload: DataPoint;
}

const data: DataPoint[] = [
  { x: 5.7, y: 35, value: "15.44", size: 60, color: "#f97316", label: "Product" },
  { x: 5.7, y: 90, value: "", size: 15, color: "#8b5cf6", label: "Sales" },
  { x: 6.7, y: 25, value: "33", size: 45, color: "#ec4899", label: "Team" },
  { x: 7.7, y: 60, value: "24,800", size: 80, color: "#8b5cf6", label: "Sales" },
  { x: 8.7, y: 35, value: "13", size: 15, color: "#ef4444", label: "User" },
  { x: 8.7, y: 75, value: "10", size: 15, color: "#ef4444", label: "User" },
  { x: 9.7, y: 45, value: "", size: 10, color: "#ec4899", label: "Team" },
  { x: 9.7, y: 85, value: "12.36", size: 50, color: "#f97316", label: "Product" },
  { x: 10.7, y: 49, value: "", size: 12, color: "#ef4444", label: "User" },
]


const CustomTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 shadow-lg">
        <p className="text-white font-semibold text-sm">{data.label}</p>
        <p className="text-slate-400 text-xs mt-1">Value: {data.value}</p>
        <p className="text-slate-400 text-xs">Position: {data.x}, {data.y}%</p>
      </div>
    );
  }
  return null;
};

export default function RecentStatsSection() {
  const renderCustomShape = (props: unknown) => {
    const { cx, cy, payload } = props as CustomShapeProps;

    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={payload.size / 2}
          fill={payload.color}
          fillOpacity={0.9}
          filter="url(#glow)"
        />
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={Math.max(10, payload.size * 0.23)}
          fontWeight="bold"
          className="font-mono drop-shadow"
        >
          {payload.value}
        </text>
      </g>
    );
  };

  return (
    <Card className="flex flex-col h-full w-full bg-[#0c0c0c] border-[#1f1f1f]">
      <CardHeader className="pb-2 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-semibold text-white">
            Recent Stats
          </CardTitle>
          <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6 flex flex-col flex-1">
        <div className="flex-1 min-h-[250px] sm:min-h-[300px] lg:min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: -10, bottom: 10, left: -10 }}
              style={{ overflow: "visible" }}
            >

              <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              <CartesianGrid
                stroke="#212121"
                strokeWidth={0.5}
                style={{ pointerEvents: "none" }}
              />
              
              <XAxis
                type="number"
                dataKey="x"
                domain={[4.7, 11]}
                ticks={[4.7, 5.7, 6.7, 7.7, 8.7, 9.7, 10.7]}
                axisLine={false}
                tickLine={true}
                tickSize={25}
                strokeWidth={0.2}
                tickMargin={10}
                tickFormatter={(value) => `${value}`}
                tick={({ x, y, payload }) => (
                  <text
                    x={x + 25}
                    y={y - 10}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={9}
                  >
                    {payload.value}
                  </text>
                )}
              />
              
              <YAxis
                type="number"
                domain={[0, 100 ]}
                ticks={[0, 25, 50, 75, 100]}
                axisLine={false}
                tickLine={true}
                tickSize={25}
                strokeWidth={0.2}
                tickFormatter={(value) => `${value}%`}
                tickMargin={10}
                tick={({ x, y, payload }) => (
                  <text
                    x={x + 15}
                    y={y + 20}
                    textAnchor="middle"
                    fill="#9ca3af"
                    fontSize={9}
                  >
                    {payload.value}%
                  </text>
                )}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Scatter 
                data={data}
                dataKey="y"
                shape={renderCustomShape}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="grid grid-cols-4 sm:flex sm:flex-wrap sm:justify-center gap-3 sm:gap-4 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-purple-500" />
            <span className="text-xs sm:text-sm text-slate-400">Sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-orange-500" />
            <span className="text-xs sm:text-sm text-slate-400">Product</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-pink-500" />
            <span className="text-xs sm:text-sm text-slate-400">Team</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-xs sm:text-sm text-slate-400">User</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}