"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Save } from "lucide-react"

const daysOfWeek = [
  { id: 0, name: "Domingo" },
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" }
]

export function WorkSchedule() {
  const [schedule, setSchedule] = useState(
    daysOfWeek.map(day => ({ 
      dayOfWeek: day.id, 
      dayName: day.name,
      startTime: "09:00", 
      endTime: "18:00",
      isActive: day.id !== 0 && day.id !== 6 // Ativo exceto fim de semana
    }))
  )
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSchedule()
  }, [])

  const fetchSchedule = async () => {
    try {
      const res = await fetch("/api/barber/schedule")
      if (res.ok) {
        const data = await res.json()
        if (data.length > 0) {
          const updatedSchedule = daysOfWeek.map(day => {
            const saved = data.find((d: any) => d.dayOfWeek === day.id)
            return saved ? {
              dayOfWeek: day.id,
              dayName: day.name,
              startTime: saved.startTime,
              endTime: saved.endTime,
              isActive: saved.isActive
            } : {
              dayOfWeek: day.id,
              dayName: day.name,
              startTime: "09:00",
              endTime: "18:00",
              isActive: false
            }
          })
          setSchedule(updatedSchedule)
        }
      }
    } catch (error) {
      console.error("Error fetching schedule:", error)
    }
  }

  const updateDaySchedule = (index: number, field: string, value: any) => {
    const updated = [...schedule]
    updated[index] = { ...updated[index], [field]: value }
    setSchedule(updated)
  }

  const saveSchedule = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/barber/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule)
      })

      if (res.ok) {
        toast.success("Horários salvos com sucesso!")
      } else {
        throw new Error("Failed to save schedule")
      }
    } catch (error) {
      console.error("Error saving schedule:", error)
      toast.error("Erro ao salvar horários")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#333]">
      <CardHeader>
        <CardTitle className="text-white">Horários de Trabalho</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {schedule.map((day, index) => (
          <div key={day.dayOfWeek} className="grid grid-cols-12 gap-4 items-center p-3 bg-[#151515] rounded-lg">
            <div className="col-span-4 flex items-center gap-3">
              <Switch
                checked={day.isActive}
                onCheckedChange={(checked) => updateDaySchedule(index, 'isActive', checked)}
              />
              <Label className={day.isActive ? "text-white" : "text-gray-400"}>
                {day.dayName}
              </Label>
            </div>
            
            <div className="col-span-3">
              <Input
                type="time"
                value={day.startTime}
                onChange={(e) => updateDaySchedule(index, 'startTime', e.target.value)}
                disabled={!day.isActive}
                className={!day.isActive ? "opacity-50" : ""}
              />
            </div>
            
            <div className="col-span-3">
              <Input
                type="time"
                value={day.endTime}
                onChange={(e) => updateDaySchedule(index, 'endTime', e.target.value)}
                disabled={!day.isActive}
                className={!day.isActive ? "opacity-50" : ""}
              />
            </div>
            
            <div className="col-span-2 text-sm text-gray-400">
              {day.isActive ? `${day.startTime} - ${day.endTime}` : 'Fechado'}
            </div>
          </div>
        ))}
        
        <Button 
          onClick={saveSchedule} 
          disabled={loading}
          className="w-full bg-[#8161FF] hover:bg-[#6a4dff]"
        >
          <Save className="h-4 w-4 mr-2" /> 
          {loading ? "Salvando..." : "Salvar Horários"}
        </Button>
      </CardContent>
    </Card>
  )
}