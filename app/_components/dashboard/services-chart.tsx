"use client"

import { useState, useEffect, useCallback } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Skeleton } from "../ui/skeleton"

const COLORS = ['#8161FF', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

interface ServiceData {
    name: string
    value: number
}

export default function ServicesChart() {
    const [data, setData] = useState<ServiceData[]>([])
    const [loading, setLoading] = useState(true)

    const fetchServicesData = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/reports/services')
            if (!response.ok) throw new Error('Erro ao carregar dados')
            
            const result = await response.json()
            setData(result)
        } catch (error) {
            console.error('Erro ao buscar serviços:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchServicesData()
    }, [fetchServicesData])

    if (loading) {
        return <Skeleton className="h-[250px] w-full rounded-lg" />
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip 
                    contentStyle={{ 
                        backgroundColor: '#0c0c0c', 
                        border: '1px solid #1f1f1f',
                        borderRadius: '8px'
                    }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value: any, name: any) => [value, name]}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}