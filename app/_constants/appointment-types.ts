export const statusConfig = {
    completed: { 
        label: "Concluído", 
        variant: "default" as const, 
        color: "bg-emerald-900/30 text-emerald-400 border-emerald-900/50" 
    },
    confirmed: { 
        label: "Confirmado", 
        variant: "secondary" as const, 
        color: "bg-blue-900/30 text-blue-400 border-blue-900/50" 
    },
    pending: { 
        label: "Pendente", 
        variant: "outline" as const, 
        color: "bg-[#6B21A8] text-[#D8B4F2] border-slate-600" 
    },
    cancelled: { 
        label: "Cancelado", 
        variant: "destructive" as const, 
        color: "bg-red-900/30 text-red-400 border-red-900/50" 
    }
} as const;

export type AppointmentStatus = keyof typeof statusConfig;

export interface AppointmentProps {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  type: string
  date: string
  location: string
  status: AppointmentStatus
  employee: string
  duration: number
  totalValue: number
}