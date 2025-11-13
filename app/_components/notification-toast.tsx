"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export function NotificationToast() {
  useEffect(() => {
    // Simula notificações
    const timer = setTimeout(() => {
      toast.success("Novo agendamento!", { description: "João Silva - 14:00" })
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return null
}