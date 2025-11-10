"use client"

import { BarberModal } from "@/app/_components/dashboard/barber-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/app/_components/ui/dropdown-menu";
import { Input } from "@/app/_components/ui/input";
import { Edit3, Filter, Loader2, Search, Trash2, UserPlus } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import z from "zod";

const schema = z.object({
  name:       z.string().min(1, "Nome é obrigatório"),
  email:      z.string().email("Email inválido"),
  phone:      z.string().optional(),
  imageUrl:   z.string().optional(),
  speciality: z.string().optional(),
  bio:        z.string().optional(),
  instagram:  z.string().optional(),
})

type Barber = z.infer<typeof schema> & { id: string; isActive: boolean; createdAt: string }

export default function BarbersPage() {
  const { data: session } = useSession()
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState("")
  const [filter, setFilter]             = useState<"all" | "active" | "inactive">("all")
  const [modalOpen, setModalOpen]       = useState(false)
  const [editing, setEditing]           = useState<Barber | null>(null)

  useEffect(() => { loadBarbers() }, [])

  const loadBarbers = async () => {
    try {
      const res = await fetch("/api/barbers")
      if (res.ok) setBarbers(await res.json())
    } finally { setLoading(false) }
  }

  const onSave = async (data: any) => {
    const url = editing ? `/api/barbers/${editing.id}` : "/api/barbers"
    const method = editing ? "PATCH" : "POST"
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })

    if (res.ok) {
      toast.success(editing ? "Barbeiro atualizado" : "Barbeiro cadastrado")
      setModalOpen(false)
      setEditing(null)
      loadBarbers()
    } else {
      toast.error("Erro ao salvar")
    }
  }

  const toggleStatus = async (id: string, status: boolean) => {
    await fetch(`/api/barbers/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isActive: !status }) })
    loadBarbers()
    toast.success(status ? "Barbeiro inativado" : "Barbeiro ativado")
  }

  const deleteBarber = async (id: string) => {
    if (!confirm("Tem certeza?")) return
    await fetch(`/api/barbers/${id}`, { method: "DELETE" })
    loadBarbers()
    toast.success("Barbeiro removido")
  }

  const filtered = barbers.filter(b => {
    const matches = b.name.toLowerCase().includes(search.toLowerCase()) || b.email.toLowerCase().includes(search.toLowerCase())
    if (filter === "active")  return matches && b.isActive
    if (filter === "inactive") return matches && !b.isActive
    return matches
  })

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Equipe</h1>
          <p className="text-muted-foreground">Gerencie seus barbeiros</p>
        </div>
        <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
          <UserPlus className="mr-2 h-4 w-4" /> Novo Barbeiro
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Pesquisar por nome ou email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" />{filter === "all" ? "Todos" : filter === "active" ? "Ativos" : "Inativos"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilter("all")}>Todos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("active")}>Ativos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("inactive")}>Inativos</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Grid de cards (responsivo) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(b => (
          <Card key={b.id} className="group hover:shadow-lg transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={b.imageUrl || `https://ui-avatars.com/api/?name=${b.name}&background=bc130d&color=fff`} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-xl">
                    {b.name[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{b.name}</h3>
                  <p className="text-sm text-muted-foreground">{b.email}</p>
                  {b.phone && <p className="text-sm text-muted-foreground">{b.phone}</p>}
                </div>
                <Badge variant={b.isActive ? "default" : "secondary"}>{b.isActive ? "Ativo" : "Inativo"}</Badge>
              </div>

              {b.speciality && <p className="text-sm text-muted-foreground">Especialidade: {b.speciality}</p>}

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => { setEditing(b); setModalOpen(true) }}>
                  <Edit3 className="h-4 w-4 mr-2" />Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toggleStatus(b.id, b.isActive)}>
                  {b.isActive ? "Desativar" : "Ativar"}
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600" onClick={() => deleteBarber(b.id)}>
                  <Trash2 className="h-4 w-4 mr-2" />Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">Nenhum barbeiro encontrado.</CardContent>
        </Card>
      )}

      {/* Modal */}
      <BarberModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        barber={editing}
        onSubmit={onSave}
      />
    </div>
  )
}