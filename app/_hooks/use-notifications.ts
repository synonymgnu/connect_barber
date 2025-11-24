import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

type Notification = {
  id: string
  type: string
  title: string
  message: string
  bookingId: string | null
  isRead: boolean
  createdAt: string
}

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications')
      if (!res.ok) throw new Error('Erro ao carregar notificações')
      return res.json() as Promise<{ notifications: Notification[]; unreadCount: number }>
    },
    staleTime: 30 * 1000, // 30s
    refetchInterval: 30 * 1000, // refetch a cada 30s
  })
}

export const useMarkAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId })
      })
      if (!res.ok) throw new Error('Erro ao marcar como lida')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true })
      })
      if (!res.ok) throw new Error('Erro ao marcar todas como lidas')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })
}
