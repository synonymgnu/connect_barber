import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export interface WorkSchedule {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export function useShopSchedule() {
  return useQuery({
    queryKey: ['schedule', 'shop'],
    queryFn: async () => {
      const res = await fetch('/api/availability/schedule?type=shop')
      if (!res.ok) throw new Error('Erro ao carregar horários da loja')
      return res.json() as Promise<WorkSchedule[]>
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useBarberSchedule(barberId: string | null) {
  return useQuery({
    queryKey: ['schedule', 'barber', barberId],
    queryFn: async () => {
      const res = await fetch(`/api/availability/schedule?type=barber&barberId=${barberId}`)
      if (!res.ok) throw new Error('Erro ao carregar horários do barbeiro')
      return res.json() as Promise<WorkSchedule[]>
    },
    enabled: !!barberId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useUpdateSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      type,
      barberId,
      schedules,
    }: {
      type: 'shop' | 'barber'
      barberId?: string
      schedules: WorkSchedule[]
    }) => {
      const res = await fetch('/api/availability/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, barberId, schedules }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erro ao salvar')
      }
      return res.json()
    },
    onSuccess: (_, { type, barberId }) => {
      if (type === 'shop') {
        queryClient.invalidateQueries({ queryKey: ['schedule', 'shop'] })
      } else {
        queryClient.invalidateQueries({ queryKey: ['schedule', 'barber', barberId] })
      }
      toast.success('Horários salvos com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao salvar horários')
    },
  })
}
