import { useQuery } from '@tanstack/react-query'

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard', 'metrics'],
    queryFn: async () => {
      const res = await fetch('/api/appointments/metrics', {
        cache: 'no-store'
      })
      if (!res.ok) throw new Error('Erro ao carregar métricas')
      return res.json()
    },
    staleTime: 0,
  })
}

export const useRecentStats = () => {
  return useQuery({
    queryKey: ['dashboard', 'recent-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/recent-stats')
      if (!res.ok) throw new Error('Erro ao carregar estatísticas')
      return res.json()
    },
    staleTime: 10 * 60 * 1000,
  })
}

export const useAppointmentStats = (timeRange: string) => {
  return useQuery({
    queryKey: ['appointments', 'stats', timeRange],
    queryFn: async () => {
      const res = await fetch(`/api/appointments/stats?range=${timeRange}`)
      if (!res.ok) throw new Error('Erro ao carregar estatísticas')
      return res.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const useAppointmentActivity = (params: {
  page: number
  pageSize: number
  search?: string
  status?: string
  dateFilterType?: string
  dateFilterValue?: string
}) => {
  return useQuery({
    queryKey: ['appointments', 'activity', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: params.page.toString(),
        pageSize: params.pageSize.toString(),
        ...(params.search && { search: params.search }),
        ...(params.status && params.status !== 'all' && { status: params.status }),
        ...(params.dateFilterType && params.dateFilterValue && {
          dateFilterType: params.dateFilterType,
          dateFilterValue: params.dateFilterValue,
        }),
      })
      const res = await fetch(`/api/appointments/activity?${searchParams}`)
      if (!res.ok) throw new Error('Erro ao carregar agendamentos')
      return res.json()
    },
    staleTime: 2 * 60 * 1000,
  })
}
