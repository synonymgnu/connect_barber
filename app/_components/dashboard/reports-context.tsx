"use client"

import { createContext, useContext } from "react"
import { useQueryClient } from "@tanstack/react-query"

interface ReportsContextValue {
  refreshAll: () => void
}

const ReportsContext = createContext<ReportsContextValue | undefined>(undefined)

export function useReports() {
  const context = useContext(ReportsContext)
  if (!context) {
    throw new Error("useReports must be used within ReportsProvider")
  }
  return context
}

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient()

  const refreshAll = () => {
    queryClient.invalidateQueries({ queryKey: ['reports'] })
  }

  return (
    <ReportsContext.Provider value={{ refreshAll }}>
      {children}
    </ReportsContext.Provider>
  )
}