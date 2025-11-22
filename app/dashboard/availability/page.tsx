import { Card, CardContent, CardHeader } from '@/app/_components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/_components/ui/tabs'
import { Clock, CalendarDays, Settings } from 'lucide-react'
import { WorkScheduleManager } from '@/app/_components/dashboard/work-schedule-manager'
import { AbsenceManager } from '@/app/_components/dashboard/absence-manager'
import { AvailabilityCalendar } from '@/app/_components/dashboard/availability-calendar'

export default function AvailabilityPage() {
  return (
    <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#8161FF]" />
          <h2 className="text-xl font-semibold text-white">
            Gerenciamento de Disponibilidade
          </h2>
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Configure horários de funcionamento e gerencie ausências da sua barbearia
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="schedule">
          <TabsList className="bg-[#0f0f0f] border border-[#1f1f1f] p-1">
            <TabsTrigger 
              value="schedule" 
              className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
            >
              <Clock className="w-4 h-4 mr-2" />
              Horários
            </TabsTrigger>
            <TabsTrigger 
              value="absences" 
              className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Ausências
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="data-[state=active]:bg-[#8161FF] data-[state=active]:text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Visualização
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule" className="mt-6">
            <WorkScheduleManager />
          </TabsContent>

          <TabsContent value="absences" className="mt-6">
            <AbsenceManager />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <AvailabilityCalendar />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}