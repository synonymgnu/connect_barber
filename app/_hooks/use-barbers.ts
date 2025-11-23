import { useQuery } from '@tanstack/react-query'

interface Barber {
  id: string
  name: string
  email?: string
  phone?: string
  imageUrl?: string
}

export function useBarbers() {
  return useQuery({
    queryKey: ['barbers'],
    queryFn: async () => {
      const response = await fetch('/api/barbershop/barbers')
      if (!response.ok) throw new Error('Erro ao carregar barbeiros')
      return response.json() as Promise<Barber[]>
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}
