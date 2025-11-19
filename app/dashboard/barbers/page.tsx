"use client"

import { BarberModal } from "@/app/_components/dashboard/barber-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Input } from "@/app/_components/ui/input";
import { Edit3, Filter, Loader2, Search, Trash2, UserPlus, Store, MoreVertical, Mail, Phone, Instagram } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Barber = {
  id: string
  name: string
  email: string
  phone?: string | null
  imageUrl?: string | null
  speciality?: string | null
  bio?: string | null
  instagram?: string | null
  isActive: boolean
  createdAt: string
}

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all")
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Barber | null>(null)
  const [hasBarbershop, setHasBarbershop] = useState<boolean | null>(null)

  useEffect(() => { 
    checkBarbershop()
    loadBarbers() 
  }, [])

  const checkBarbershop = async () => {
    try {
      const res = await fetch("/api/admin/barbershop")
      if (res.ok) {
        const data = await res.json()
        setHasBarbershop(data.hasBarbershop)
        
        if (!data.hasBarbershop) {
          toast.error("Você precisa criar uma barbearia primeiro")
        }
      }
    } catch (error) {
      console.error("Erro ao verificar barbearia:", error)
    }
  }

  const createBarbershop = async () => {
    try {
      const res = await fetch("/api/admin/barbershop", { method: "POST" })
      if (res.ok) {
        toast.success("Barbearia criada com sucesso!")
        setHasBarbershop(true)
        loadBarbers()
      } else {
        toast.error("Erro ao criar barbearia")
      }
    } catch (error) {
      console.error("Erro ao criar barbearia:", error)
      toast.error("Erro ao criar barbearia")
    }
  }

  const loadBarbers = async () => {
    try {
      const res = await fetch("/api/barbers")
      if (res.ok) {
        const data = await res.json()
        setBarbers(data)
      } else {
        console.error("Erro ao carregar barbeiros")
      }
    } catch (error) {
      console.error("Erro ao carregar barbeiros:", error)
      toast.error("Erro ao carregar barbeiros")
    } finally { 
      setLoading(false) 
    }
  }

  const onSave = async (data: any) => {
    try {
      const url = editing ? `/api/barbers/${editing.id}` : "/api/barbers"
      const method = editing ? "PATCH" : "POST"
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(data) 
      })

      if (res.ok) {
        toast.success(editing ? "Barbeiro atualizado com sucesso!" : "Barbeiro cadastrado com sucesso!")
        setModalOpen(false)
        setEditing(null)
        await loadBarbers()
      } else {
        const errorData = await res.json()
        toast.error(errorData.error || "Erro ao salvar")
      }
    } catch (error) {
      console.error("Erro ao salvar barbeiro:", error)
      toast.error("Erro ao salvar barbeiro")
    }
  }

  const toggleStatus = async (id: string, status: boolean) => {
    try {
      const res = await fetch(`/api/barbers/${id}`, { 
        method: "PATCH", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ isActive: !status }) 
      })
      
      if (res.ok) {
        await loadBarbers()
        toast.success(status ? "Barbeiro inativado com sucesso!" : "Barbeiro ativado com sucesso!")
      } else {
        toast.error("Erro ao alterar status")
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error)
      toast.error("Erro ao alterar status")
    }
  }

  const deleteBarber = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este barbeiro? Esta ação não pode ser desfeita.")) return
    
    try {
      const res = await fetch(`/api/barbers/${id}`, { method: "DELETE" })
      
      if (res.ok) {
        await loadBarbers()
        toast.success("Barbeiro removido com sucesso!")
      } else {
        toast.error("Erro ao remover barbeiro")
      }
    } catch (error) {
      console.error("Erro ao remover barbeiro:", error)
      toast.error("Erro ao remover barbeiro")
    }
  }

  const filtered = barbers.filter(b => {
    const matches = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase())
    if (filter === "active")  return matches && b.isActive
    if (filter === "inactive") return matches && !b.isActive
    return matches
  })

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  if (hasBarbershop === false) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center">
          <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Barbearia Não Encontrada</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa criar uma barbearia antes de adicionar barbeiros.
          </p>
          <Button onClick={createBarbershop}>
            <UserPlus className="mr-2 h-4 w-4" /> Criar Minha Barbearia
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Equipe</h1>
          <p className="text-muted-foreground mt-1">Gerencie sua equipe de barbeiros</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }} size="lg">
          <UserPlus className="mr-2 h-5 w-5" /> Adicionar Barbeiro
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar por nome ou email..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-10" 
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filter === "all" ? "Todos" : filter === "active" ? "Ativos" : "Inativos"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")}>Ativos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inactive")}>Inativos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {barbers.length === 0 ? "Nenhum barbeiro cadastrado" : "Nenhum barbeiro encontrado"}
            </h3>
            <p className="text-muted-foreground text-center mb-6">
              {barbers.length === 0 
                ? "Comece adicionando o primeiro barbeiro da sua equipe" 
                : "Tente ajustar os filtros de pesquisa"}
            </p>
            {barbers.length === 0 && (
              <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
                <UserPlus className="mr-2 h-4 w-4" /> Adicionar Primeiro Barbeiro
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(b => (
            <Card key={b.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                      <AvatarImage src={b.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.name)}&background=bc130d&color=fff`} />
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-700 text-white text-xl font-semibold">
                        {b.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{b.name}</CardTitle>
                      <Badge variant={b.isActive ? "default" : "secondary"} className="mt-1">
                        {b.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditing(b); setModalOpen(true) }}>
                        <Edit3 className="h-4 w-4 mr-2" />Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleStatus(b.id, b.isActive)}>
                        {b.isActive ? "Desativar" : "Ativar"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteBarber(b.id)} className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{b.email}</span>
                </div>
                {b.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{b.phone}</span>
                  </div>
                )}
                {b.instagram && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Instagram className="h-4 w-4" />
                    <span>{b.instagram}</span>
                  </div>
                )}
                {b.speciality && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Especialidade</p>
                    <p className="text-sm text-muted-foreground">{b.speciality}</p>
                  </div>
                )}
                {b.bio && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Bio</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">{b.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <BarberModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open)
          if (!open) setEditing(null)
        }}
        barber={editing}
        onSubmit={onSave}
      />
    </div>
  )
}