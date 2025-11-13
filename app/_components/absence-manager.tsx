"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Button } from "./ui/button"
import { Plus } from "lucide-react"
import { format } from "date-fns"

export function AbsenceManager() {
  const [absences, setAbsences] = useState<any[]>([])
  const [date, setDate] = useState("")
  const [reason, setReason] = useState("")

  const addAbsence = async () => {
    if (!date || !reason) return
    const newAbsence = { date, reason }
    await fetch("/api/barber/absences", { method: "POST", body: JSON.stringify(newAbsence) })
    setAbsences([...absences, newAbsence])
    setDate("")
    setReason("")
    toast.success("Folga registrada!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Folgas e Ausências</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Data</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label>Motivo</Label>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: Folga, consulta médica..." />
          </div>
        </div>
        <Button onClick={addAbsence}>
          <Plus className="h-4 w-4 mr-2" /> Adicionar Folga
        </Button>

        <div className="space-y-2">
          {absences.map((absence, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="text-sm">{format(new Date(absence.date), "dd/MM/yyyy")} - {absence.reason}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}