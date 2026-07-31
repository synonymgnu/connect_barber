"use client"

import { useState, useEffect, useCallback } from "react"
import { format, addDays } from "date-fns"
import { toast } from "sonner"
import { SidebarProvider, SidebarTrigger } from "@/app/_components/ui/sidebar"
import { BarberSidebar } from "@/app/_components/dashboard/barber-sidebar"
import BarberSidebarMobile from "@/app/_components/dashboard/barber-sidebar-mobile"
import BarberDashboard from "@/app/_components/dashboard/barber-dashboard"
import { WorkSchedule } from "@/app/_components/work-schedule"
import { BarberAbsenceManager } from "@/app/_components/dashboard/barber-absence-manager"
import NotionCalendar from "@/app/_components/calendar/notion-calendar"
import AuthCheck from "@/app/_components/auth-check"
import ReviewsChart from "@/app/_components/reviews-chart"

import "./fullcalendar-theme.css"

interface Booking {
  id: string
  clientName: string
  serviceName: string
  date: string
  status: string
  price: number
}

interface RawBooking {
  id: string
  date: string
  status: string
  user: { name: string }
  service: { name: string; price: number }
}

export default function BarberSchedulePage() {
  const [activeSection, setActiveSection] = useState("calendar")
  const [period, setPeriod] = useState<"day" | "week" | "month">("week")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, cancelled: 0, revenue: 0, avgRating: 0 })
  const [reviews, setReviews] = useState<{ id: string; value: number; clientName: string; serviceName: string; date: string }[]>([])

  const fetchBookings = useCallback(async () => {
    const start = format(addDays(new Date(), -90), "yyyy-MM-dd")
    const end = format(addDays(new Date(), 90), "yyyy-MM-dd")
    const res = await fetch(`/api/barber/bookings?start=${start}&end=${end}`)
    if (!res.ok) { toast.error("Erro ao carregar agendamentos"); return }
    const data: RawBooking[] = await res.json()
    setBookings(data.map((b) => ({
      id: b.id,
      clientName: b.user.name,
      serviceName: b.service.name,
      date: b.date,
      status: b.status,
      price: Number(b.service.price),
    })))
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch(`/api/barber/stats?period=${period}`)
    if (res.ok) setStats(await res.json())
  }, [period])

  const fetchReviews = useCallback(async () => {
    const res = await fetch("/api/barber/reviews")
    if (res.ok) setReviews(await res.json())
  }, [])

  useEffect(() => {
    fetchBookings(); fetchStats(); fetchReviews()
  }, [fetchBookings, fetchStats, fetchReviews])

  useEffect(() => {
    const interval = setInterval(() => { fetchBookings(); fetchStats() }, 30_000)
    return () => clearInterval(interval)
  }, [fetchBookings, fetchStats])

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL
    if (!wsUrl) return
    try {
      const ws = new WebSocket(wsUrl)
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === "new_booking") { toast.success("Novo agendamento!", { description: `${data.clientName} - ${data.time}` }); fetchBookings() }
          if (data.type === "cancelled_booking") { toast.error("Agendamento cancelado", { description: `${data.clientName} - ${data.time}` }); fetchBookings() }
        } catch {}
      }
      return () => { if (ws.readyState === WebSocket.OPEN) ws.close() }
    } catch {}
  }, [fetchBookings])

  return (
    <AuthCheck requiredRole="BARBER">
      {/* Calendário em tela cheia */}
      {activeSection === "calendar" && (
        <div className="fixed inset-0 bg-[#0a0a0a] flex flex-col">
          <NotionCalendar
            role="BARBER"
            onExit={() => setActiveSection("overview")}
          />
        </div>
      )}

      {/* Layout com sidebar */}
      {activeSection !== "calendar" && (
        <SidebarProvider>
          <div className="flex min-h-screen w-full">
            <BarberSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
            <div className="flex flex-col flex-1 min-w-0">
              <header className="flex items-center gap-2 border-b px-4 py-3 shrink-0">
                <div className="hidden lg:block">
                  <SidebarTrigger />
                </div>
                <BarberSidebarMobile onSectionChange={setActiveSection} />
                <h1 className="font-semibold text-lg">Dashboard do Barbeiro</h1>
              </header>
              <main className="flex-1 overflow-auto p-4 lg:p-6">

                {activeSection === "overview" && (
                  <BarberDashboard
                    bookings={bookings}
                    stats={stats}
                    reviews={reviews}
                    period={period}
                    onPeriodChange={setPeriod}
                    onRefresh={() => { fetchBookings(); fetchStats() }}
                  />
                )}

                {activeSection === "reviews" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4">Avaliações</h2>
                    <ReviewsChart reviews={reviews} />
                  </div>
                )}

                {activeSection === "schedule" && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-semibold">Horários & Ausências</h2>
                    <WorkSchedule />
                    <BarberAbsenceManager />
                  </div>
                )}

              </main>
            </div>
          </div>
        </SidebarProvider>
      )}
    </AuthCheck>
  )
}
