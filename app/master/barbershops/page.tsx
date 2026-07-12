'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/_components/ui/card'
import { Button } from '@/app/_components/ui/button'
import {
  AlertCircle,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Store,
  Trash2,
  Edit,
} from 'lucide-react'
import Image from 'next/image'

interface Barbershop {
  id: string
  name: string
  address: string
  images: string
  description: string
  phone: string[]
  isActive: boolean
  createdAt: string
  owner: {
    id: string
    name: string
    email: string
  }
  _count: {
    barbers: number
  }
}

export default function BarbershopsListPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Proteger rota
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }
    if (status === 'authenticated' && session?.user?.role !== 'MASTER') {
      router.push('/')
      return
    }
  }, [status, session?.user?.role, router])

  // Buscar barbearias
  useEffect(() => {
    if (status !== 'authenticated') return

    const fetchBarbershops = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const res = await fetch('/api/master/barbershops')
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Erro ao carregar barbearias')
          return
        }

        setBarbershops(data)
      } catch (err) {
        console.error('Erro ao buscar barbearias:', err)
        setError('Erro ao carregar barbearias')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBarbershops()
  }, [status])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta barbearia?')) return

    setDeleting(id)
    try {
      const res = await fetch(`/api/master/barbershops/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Erro ao deletar barbearia')
        setDeleting(null)
        return
      }

      setBarbershops((prev) => prev.filter((shop) => shop.id !== id))
    } catch (err) {
      console.error('Erro ao deletar barbearia:', err)
      alert('Erro ao deletar barbearia')
      setDeleting(null)
    }
  }, [])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#151619] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-violet-500" />
          <p className="mt-4 text-zinc-400">Carregando barbearias...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'MASTER') {
    return null
  }

  return (
    <div className="min-h-screen bg-[#151619] text-zinc-100">
      <div className="max-w-7xl mx-auto space-y-8 px-5 lg:px-16 pt-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-white">
              <Store className="h-8 w-8 text-violet-500" />
              Barbearias
            </h1>
            <p className="text-zinc-400 mt-2">
              Gerencie todas as barbearias da plataforma
            </p>
          </div>
          <Button
            onClick={() => router.push('/master/barbershops/new')}
            className="bg-violet-500 hover:bg-violet-600 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Nova Barbearia
          </Button>
        </div>

        {/* Erro */}
        {error && (
          <div className="flex gap-3 p-4 rounded-lg bg-red-900/20 border border-red-500/30">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Lista de barbearias */}
        {barbershops.length === 0 ? (
          <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
            <CardContent className="py-12">
              <div className="text-center">
                <Store className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                <p className="text-zinc-400 mb-4">
                  Nenhuma barbearia cadastrada
                </p>
                <Button
                  onClick={() => router.push('/master/barbershops/new')}
                  className="bg-violet-500 hover:bg-violet-600 text-white gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Criar a primeira barbearia
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbershops.map((barbershop) => (
              <Card
                key={barbershop.id}
                className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl overflow-hidden hover:border-violet-500/50 transition-colors group"
              >
                {/* Imagem */}
                <div className="relative h-48 w-full overflow-hidden bg-[#1f2022]">
                  {barbershop.images[0] ? (
                    <Image
                      src={barbershop.images[0]}
                      alt={barbershop.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-zinc-600" />
                    </div>
                  )}

                  {/* Badge de status */}
                  <div className="absolute top-3 right-3">
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        barbershop.isActive
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {barbershop.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  {/* Nome */}
                  <div>
                    <h3 className="text-lg font-bold text-white line-clamp-1">
                      {barbershop.name}
                    </h3>
                    <p className="text-zinc-500 text-xs">
                      ID: {barbershop.id.substring(0, 8)}...
                    </p>
                  </div>

                  {/* Endereço */}
                  <p className="text-zinc-400 text-sm flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-2">{barbershop.address}</span>
                  </p>

                  {/* Telefones */}
                  {barbershop.phone.length > 0 && (
                    <p className="text-zinc-400 text-sm flex items-start gap-2">
                      <Phone className="h-4 w-4 text-violet-500 mt-0.5 flex-shrink-0" />
                      <span>{barbershop.phone.join(', ')}</span>
                    </p>
                  )}

                  {/* Stats */}
                  <div className="pt-3 border-t border-[#2b2c2e] flex justify-between text-sm">
                    <div>
                      <p className="text-zinc-500">Barbeiros</p>
                      <p className="text-white font-bold">
                        {barbershop._count.barbers}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-zinc-500">Proprietário</p>
                      <p className="text-white font-bold text-xs line-clamp-1">
                        {barbershop.owner?.name || 'Sem proprietário'}
                      </p>
                    </div>
                  </div>

                  {/* Descrição */}
                  {barbershop.description && (
                    <p className="text-zinc-500 text-xs line-clamp-2 pt-2">
                      {barbershop.description}
                    </p>
                  )}

                  {/* Ações */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() =>
                        router.push(`/master/barbershops/${barbershop.id}/edit`)
                      }
                      variant="outline"
                      size="sm"
                      className="flex-1 border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      onClick={() => handleDelete(barbershop.id)}
                      disabled={deleting === barbershop.id}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    >
                      {deleting === barbershop.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-1" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-1" />
                      )}
                      Deletar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats gerais */}
        {barbershops.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-zinc-500 text-sm mb-1">
                    Total de Barbearias
                  </p>
                  <p className="text-3xl font-bold text-violet-500">
                    {barbershops.length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-zinc-500 text-sm mb-1">Ativas</p>
                  <p className="text-3xl font-bold text-green-500">
                    {barbershops.filter((b) => b.isActive).length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-[#1a1b1d] border border-[#1f2022] rounded-2xl">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-zinc-500 text-sm mb-1">
                    Total de Barbeiros
                  </p>
                  <p className="text-3xl font-bold text-blue-500">
                    {barbershops.reduce((sum, b) => sum + b._count.barbers, 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
