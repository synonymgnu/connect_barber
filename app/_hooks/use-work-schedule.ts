import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface WorkSchedule {
  id?: string
  dayOfWeek: number
  startTime: string
  endTime: string
  isActive: boolean
}

export function useWorkSchedule() {
  return useQuery({
    queryKey: ['work-schedule'],
    queryFn: async () => {
      const response = await fetch('/api/availability/schedule')
      if (!response.ok) throw new Error('Erro ao carregar horários')
      return response.json() as Promise<WorkSchedule[]>
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  })
}

export function useUpdateWorkSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (schedules: WorkSchedule[]) => {
      const response = await fetch('/api/availability/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ schedules }),
      })
      if (!response.ok) throw new Error('Erro ao salvar')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-schedule'] })
      toast.success('Horários salvos com sucesso!')
    },
    onError: () => {
      toast.error('Erro ao salvar horários')
    },
  })
}
