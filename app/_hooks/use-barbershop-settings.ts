import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface BarbershopSettings {
  name: string
  address: string
  description: string
  images: string[]
  phone: string[]
}

export function useBarbershopSettings() {
  return useQuery({
    queryKey: ['barbershop-settings'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/settings')
      if (!response.ok) throw new Error('Erro ao carregar configurações')
      return response.json() as Promise<BarbershopSettings>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}

export function useUpdateBarbershopSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BarbershopSettings) => {
      const checkResponse = await fetch('/api/barbershop/settings')
      const method = checkResponse.status === 404 ? 'POST' : 'PATCH'

      const response = await fetch('/api/barbershop/settings', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Erro ao salvar')
      return { method }
    },
    onSuccess: ({ method }) => {
      queryClient.invalidateQueries({ queryKey: ['barbershop-settings'] })
      toast.success(
        method === 'POST' ? 'Barbearia criada!' : 'Configurações salvas!'
      )
    },
    onError: () => {
      toast.error('Erro ao salvar configurações')
    },
  })
}
