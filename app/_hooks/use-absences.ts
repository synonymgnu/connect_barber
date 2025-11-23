import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface Absence {
  id: string
  date: Date
  reason: string
  isAllDay: boolean
  barberId: string | null
  barberName: string | null
  type: 'BARBER_ABSENCE' | 'SHOP_CLOSURE'
}

export function useAbsences() {
  return useQuery({
    queryKey: ['absences'],
    queryFn: async () => {
      const response = await fetch('/api/availability/absences')
      if (!response.ok) throw new Error('Erro ao carregar ausências')
      const data = await response.json()
      return data.map((a: any) => ({ ...a, date: new Date(a.date) })) as Absence[]
    },
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreateAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/availability/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.details || error.error)
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['absences'] })
      toast.success(
        variables.type === 'SHOP_CLOSURE'
          ? 'Fechamento registrado!'
          : 'Ausência registrada!'
      )
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteAbsence() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/availability/absences/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Erro ao excluir')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['absences'] })
      toast.success('Registro excluído!')
    },
    onError: () => {
      toast.error('Erro ao excluir registro')
    },
  })
}
