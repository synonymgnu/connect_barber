"use client"

import { useState, useEffect, useCallback } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "../ui/skeleton"

interface PerformanceData {
    date: string
    revenue: number
    appointments: number
}

export default function PerformanceChart() {
    const [data, setData] = useState<PerformanceData[]>([])
    const [loading, setLoading] = useState(true)
    const [view, setView] = useState<'revenue' | 'appointments'>('revenue')

    const fetchPerformanceData = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/reports/performance')
            if (!response.ok) throw new Error('Erro ao carregar dados')
            
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Erro ao buscar performance:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchPerformanceData()
    }, [fetchPerformanceData])

    if (loading) {
        return <Skeleton className="h-[300px] w-full rounded-lg" />
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setView('revenue')}
                    className={`px-3 py-1.5 rounded-md text-sm transition ${
                        view === 'revenue' 
                            ? 'bg-[#8161FF] text-white' 
                            : 'bg-[#0f0f0f] text-slate-400 hover:bg-[#1a1a1a]'
                    }`}
                >
                    Receita
                </button>
                <button
                    onClick={() => setView('appointments')}
                    className={`px-3 py-1.5 rounded-md text-sm transition ${
                        view === 'appointments' 
                            ? 'bg-[#8161FF] text-white' 
                            : 'bg-[#0f0f0f] text-slate-400 hover:bg-[#1a1a1a]'
                    }`}
                >
                    Agendamentos
                </button>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                    <XAxis 
                        dataKey="date" 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <YAxis 
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => 
                            view === 'revenue' 
                                ? `R$ ${value}` 
                                : value.toString()
                        }
                    />
                    <Tooltip 
                        contentStyle={{ 
                            backgroundColor: '#0c0c0c', 
                            border: '1px solid #1f1f1f',
                            borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: any) => [
                            view === 'revenue' 
                                ? `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                                : value,
                            view === 'revenue' ? 'Receita' : 'Agendamentos'
                        ]}
                    />
                    <Legend />
                    <Line 
                        type="monotone" 
                        dataKey={view}
                        stroke={view === 'revenue' ? '#10b981' : '#3b82f6'}
                        strokeWidth={2}
                        dot={{ fill: view === 'revenue' ? '#10b981' : '#3b82f6' }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}