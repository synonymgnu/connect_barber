"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSession } from "next-auth/react"
import { format, addDays } from "date-fns"
import { toast } from "sonner"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import ptLocale from "@fullcalendar/core/locales/pt-br"

import { Button } from "@/app/_components/ui/button"
import StatsCards from "@/app/_components/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import { Card, CardContent } from "@/app/_components/ui/card"
import BookingsTable from "@/app/_components/bookings-table"
import ProfileCard from "@/app/_components/profile-card"
import ReviewsChart from "@/app/_components/reviews-chart"
import { WorkSchedule } from "@/app/_components/work-schedule"
import { AbsenceManager } from "@/app/_components/absence-manager"
import { NotificationToast } from "@/app/_components/notification-toast"

import "./fullcalendar-theme.css"
import AuthCheck from "@/app/_components/auth-check"

interface Booking {
  id: string
  clientName: string
  serviceName: string
  date: string
  status: string
  price: number
}

export default function BarberSchedulePage() {
  const { data: session } = useSession()
  const [period, setPeriod] = useState<"day" | "week" | "month">("day")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, revenue: 0, avgRating: 0 })
  const [reviews, setReviews] = useState<{ id: string, value: number, clientName: string, serviceName: string, date: string }[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())

  const fetchBookings = useCallback(async () => {
    const start = format(selectedDate, "yyyy-MM-dd")
    const end = format(addDays(selectedDate, period === "day" ? 0 : period === "week" ? 7 : 30), "dd-MM-yyyy")
    const res = await fetch(`/api/barber/bookings?start=${start}&end=${end}`)
    if (res.ok) setBookings(await res.json())
  }, [selectedDate, period])

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/barber/stats?period=${period}`)
    if (res.ok) setStats(await res.json())
  }, [period])

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/barber/reviews")
    if (res.ok) setReviews(await res.json())
  }, [])

  useEffect(() => {
    fetchBookings()
    fetchStats()
    fetchReviews()
  }, [fetchBookings, fetchStats, fetchReviews])

  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || "")
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.type === "new_booking") {
        toast.success("Novo agendamento!", { description: `${data.clientName} - ${data.time}` })
        fetchBookings()
      }
      if (data.type === "cancelled_booking") {
        toast.error("Agendamento cancelado", { description: `${data.clientName} - ${data.time}` })
        fetchBookings()
      }
    }
    return () => ws.close()
  }, [fetchBookings])

  // Eventos do calendário
  const calendarEvents = useMemo(() => bookings.map(b => ({
    id: b.id,
    title: `${b.clientName} - ${b.serviceName}`,
    start: b.date,
    className: `bg-status-${b.status.toLowerCase()}`
  })), [bookings])

  // View inicial do calendário
  const initialView = useMemo(() => {
     if (period === "day") return "timeGridDay";
     if (period === "week") return "timeGridWeek";
     return "dayGridMonth";
  }, [period]);

  return (
    <AuthCheck requiredRole="BARBER">
      <div className="min-h-screen text-white p-3 sm:p-4 md:p-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                Dashboard do Barbeiro
              </h1>
              <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">Gerencie sua agenda e desempenho profissional</p>
            </div>
            <div className="flex gap-1 sm:gap-2 bg-[#1A1A1A] p-1 rounded-lg border border-[#333] w-fit mx-auto sm:mx-0">
              <Button
                variant={period === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod("day")}
                className={`
                  ${period === "day" 
                    ? "bg-[#8161FF] hover:bg-[#6a4dff] text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-[#333]"
                  } transition-all duration-200 font-semibold text-xs sm:text-sm px-2 sm:px-3
                `}
              >
                Hoje
              </Button>
              <Button
                variant={period === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod("week")}
                className={`
                  ${period === "week" 
                    ? "bg-[#8161FF] hover:bg-[#6a4dff] text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-[#333]"
                  } transition-all duration-200 font-semibold text-xs sm:text-sm px-2 sm:px-3
                `}
              >
                Semana
              </Button>
              <Button
                variant={period === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriod("month")}
                className={`
                  ${period === "month" 
                    ? "bg-[#8161FF] hover:bg-[#6a4dff] text-white shadow-lg" 
                    : "text-gray-300 hover:text-white hover:bg-[#333]"
                  } transition-all duration-200 font-semibold text-xs sm:text-sm px-2 sm:px-3
                `}
              >
                Mês
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} className="mb-6 sm:mb-8" />

          <Card className="bg-[#1A1A1A] border-[#333] shadow-2xl">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <Tabs defaultValue="calendar" className="space-y-4 sm:space-y-6">
                
                <TabsList
                  className="flex bg-[#151515] border border-[#333] p-1 rounded-lg gap-1 overflow-x-auto scrollbar-hide min-h-[2.5rem] justify-start"
                >
                  {[
                    { value: "calendar", label: "Calendário", icon: "📅", shortLabel: "Calend." },
                    { value: "bookings", label: "Agendamentos", icon: "📋", shortLabel: "Agend." },
                    { value: "profile", label: "Perfil", icon: "👤", shortLabel: "Perfil" },
                    { value: "reviews", label: "Avaliações", icon: "⭐", shortLabel: "Aval." },
                    { value: "schedule", label: "Horários", icon: "⏰", shortLabel: "Horários" },
                  ].map((tab) => (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className="
                        data-[state=active]:bg-[#8161FF] data-[state=active]:text-white data-[state=active]:shadow-lg
                        data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white data-[state=inactive]:hover:bg-[#333]
                        transition-all duration-200 font-semibold text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3
                        flex items-center gap-1 sm:gap-2 justify-center whitespace-nowrap flex-shrink-0 min-w-[70px] sm:min-w-[100px]
                      "
                    >
                      <span className="text-xs sm:text-sm">{tab.icon}</span>
                      <span className="hidden xs:inline">{tab.label}</span>
                      <span className="xs:hidden">{tab.shortLabel}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="calendar" className="space-y-3 sm:space-y-4">
                  <Card className="bg-[#0F0F0F] border-2 border-[#333] shadow-xl">
                    <CardContent className="p-0">
                      <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView={initialView}
                        headerToolbar={{
                          left: "prev,next today",
                          center: "title",
                          right: "dayGridMonth,timeGridWeek,timeGridDay"
                        }}
                        events={calendarEvents}
                        locale={ptLocale}
                        height="auto"
                        dateClick={(info) => setSelectedDate(info.date)}
                        eventClick={(info) => toast.info("Detalhes do Agendamento", { description: info.event.title })}
                        themeSystem="standard"
                        dayMaxEvents={true}
                        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
                        contentHeight="auto"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="bookings" className="space-y-4">
                  <BookingsTable bookings={bookings} onRefresh={fetchBookings} />
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                  <ProfileCard />
                </TabsContent>

                <TabsContent value="reviews" className="space-y-4">
                  <ReviewsChart reviews={reviews} />
                </TabsContent>

                <TabsContent value="schedule" className="space-y-4">
                  <WorkSchedule />
                  <AbsenceManager />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <NotificationToast />
        </div>
      </div>
    </AuthCheck>
  )
}