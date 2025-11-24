"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Calendar as CalendarIcon, 
  ChevronDown,
  Search, 
  Loader2,
  X,
  Globe,
  Store
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAppointmentActivity } from "@/app/_hooks/use-dashboard-metrics";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MobileAppointmentCard from "./mobile-appointment-card";
import DesktopAppointmentItem from "./desktop-appointment-item";
import AppointmentFilterControls from "./appointment-filter-controls";
import { Skeleton } from "../ui/skeleton";
import { AppointmentModal } from "./appointment-modal";
import DeleteConfirmationDialog from "./delete-confirmation-dialog";
import { useQueryClient } from "@tanstack/react-query";

export interface AppointmentProps {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerImageUrl?: string | null;
  type: string;
  serviceId: string;
  date: string;
  dateIso?: string;
  source: 'PRESENCIAL' | 'ONLINE';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  employee: string;
  employeeId: string;
  duration: number;
  totalValue: number;
}

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  confirmed: { label: 'Confirmado', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  completed: { label: 'Concluído', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-red-500/20 text-red-500 border-red-500/30' },
};

const sourceConfig = {
  PRESENCIAL: { label: 'Presencial', color: 'text-[#8161FF]', icon: Store },
  ONLINE: { label: 'Online', color: 'text-orange-500', icon: Globe }
}

const AppointmentActivitySection = () => {
  const queryClient = useQueryClient();
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<keyof typeof statusConfig | 'all'>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const [dateFilter, setDateFilter] = useState<{ type: 'dia' | 'semana' | 'mes' | 'ano' | null; value: Date | null }>({
    type: null,
    value: null
  })

  // modal
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [barbershopServices, setBarbershopServices] = useState<any[]>([])
  const [barbers, setBarbers] = useState<any[]>([])
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view')

  const toggleSelectAll = () => {
    if (selectedAppointmentIds.size === appointments.length && appointments.length > 0) {
      setSelectedAppointmentIds(new Set());
    } else {
      const allFilteredIds = new Set(appointments.map(appointment => appointment.id));
      setSelectedAppointmentIds(allFilteredIds);
    }
  };

  const toggleSelectOne = (id: string) => {
    const newSelected = new Set(selectedAppointmentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAppointmentIds(newSelected);
  };

  const clearSelection = () => {
    setSelectedAppointmentIds(new Set());
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;
    return (
      <Badge variant="default" className={`${config.color} px-3 py-1 rounded-xl text-xs sm:text-sm border`}>
        {config.label}
      </Badge>
    );
  };

  const getSourceDisplay = (source: string) => {
    const config = sourceConfig[source as keyof typeof sourceConfig];
    if (!config) return null;
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <Icon className="h-3.5 w-3.5" />
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  // ações menu
  const handleAction = (action: string, id: string) => {
    const appointment = appointments.find(appt => appt.id === id)
    
    if (action === 'view' || action === 'edit') {
      setSelectedAppointment(appointment)
      setModalMode(action)
      setModalOpen(true)
    } else if (action === 'delete') {
      setAppointmentToDelete(id)
      setDeleteDialogOpen(true)
    }
  }

  // salvar
  const handleSaveAppointment = async (formData: any) => {
    try {
      const response = await fetch(`/api/appointments/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['appointments', 'activity'] }),
          queryClient.invalidateQueries({ queryKey: ['dashboard', 'metrics'] })
        ])
        setModalOpen(false)
        clearSelection()
      } else {
        throw new Error('Erro ao salvar agendamento')
      }
    } catch (error) {
      console.error('Error saving appointment:', error)
      alert('Erro ao salvar agendamento')
    }
  }

  // deletar
  const handleDeleteAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await queryClient.invalidateQueries({ queryKey: ['appointments', 'activity'] })
        clearSelection()
        setDeleteDialogOpen(false)
        setAppointmentToDelete(null)
      } else {
        throw new Error('Erro ao excluir agendamento')
      }
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Erro ao excluir agendamento')
    }
  }

  const handleClearFilters = () => {
    setDateFilter({ type: null, value: null });
    setStatusFilter('all');
    setSearchTerm("");
    setCurrentPage(1);
    clearSelection();
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    clearSelection();
  }, [currentPage, statusFilter, debouncedSearch, dateFilter]);

  const { data, isLoading: loading, error } = useAppointmentActivity({
    page: currentPage,
    pageSize: itemsPerPage,
    search: debouncedSearch,
    status: statusFilter,
    dateFilterType: dateFilter.type || undefined,
    dateFilterValue: dateFilter.value?.toISOString(),
  })

  const appointments = data?.data || []
  const totalPages = data?.totalPages || 1
  const totalCount = data?.totalCount || 0

  useEffect(() => {
    if (modalOpen) {
      const fetchBarbershopData = async () => {
        try {
          const [servicesRes, barbersRes] = await Promise.all([
            fetch(`/api/barbershop/services`),
            fetch(`/api/barbershop/barbers`)
          ])
          
          if (servicesRes.ok && barbersRes.ok) {
            const services = await servicesRes.json()
            const barbersData = await barbersRes.json()
            setBarbershopServices(services)
            setBarbers(barbersData)
          }
        } catch (error) {
          console.error('Error fetching barbershop data:', error)
        }
      }
      fetchBarbershopData()
    }
  }, [modalOpen]);

  const renderPaginationItems = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      );
    }

    const items = [];
    items.push(
      <Button
        key="prev"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1 || loading}
        className="text-slate-400 border-slate-700 hover:bg-slate-800/50 disabled:opacity-50"
      >
        Anterior
      </Button>
    );

    const visiblePages = 3;
    const startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages, startPage + visiblePages - 1);

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <Button
          key={i}
          variant={currentPage === i ? "secondary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(i)}
          disabled={loading}
          className={currentPage === i ? "bg-[#8161FF] text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
        >
          {i}
        </Button>
      );
    }

    if (endPage < totalPages && totalPages > visiblePages) {
      items.push(<span key="ellipsis-end" className="px-2 text-slate-500">...</span>);
      items.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "secondary" : "outline"}
          size="sm"
          onClick={() => setCurrentPage(totalPages)}
          disabled={loading}
          className={currentPage === totalPages ? "bg-[#8161FF] text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
        >
          {totalPages}
        </Button>
      );
    }

    items.push(
      <Button
        key="next"
        variant="outline"
        size="sm"
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages || totalPages === 0 || loading}
        className="text-slate-400 border-slate-700 hover:bg-slate-800/50 disabled:opacity-50"
      >
        Próximo
      </Button>
    );

    return items;
  }, [currentPage, totalPages, loading]);

  return (
    <>
      <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
        <CardHeader className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold text-white">Atividade de Agendamentos</CardTitle>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {/* Busca */}
            <div className="relative flex-1 min-w-[150px]">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar agendamentos..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 bg-[#0f0f0f] border-slate-700 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 w-full"
              />
            </div>
            <div className="mt-4 lg:mt-0 w-full lg:w-auto">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Select
                  value={dateFilter.type || 'todos'}
                  onValueChange={(val) => {
                    if (val === 'todos') {
                      setDateFilter({ type: null, value: null })
                    } else {
                      setDateFilter({ 
                        type: val as typeof dateFilter.type, 
                        value: dateFilter.value
                      })
                    }
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[140px] bg-[#0f0f0f] border-slate-700 text-slate-300">
                    <SelectValue placeholder="Filtrar por..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f0f0f] border-slate-700 text-slate-300">
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="dia">Dia</SelectItem>
                    <SelectItem value="semana">Semana</SelectItem>
                    <SelectItem value="mes">Mês</SelectItem>
                    <SelectItem value="ano">Ano</SelectItem>
                  </SelectContent>
                </Select>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#0f0f0f] border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white w-full min-w-[180px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                      {dateFilter.value ? format(dateFilter.value, "dd 'de' MMM yyyy", { locale: ptBR }) : "Selecionar data"}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#0f0f0f] border-slate-700">
                    <Calendar
                      mode="single"
                      selected={dateFilter.value ?? undefined}
                      onSelect={(date) => {
                        setDateFilter(prev => ({ 
                          type: date ? 'dia' : prev.type, 
                          value: date ?? null 
                        }))
                        setCurrentPage(1)
                      }}
                      locale={ptBR}
                      className="bg-[#0f0f0f] text-white"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filtros e Controles */}
          <AppointmentFilterControls
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            setCurrentPage={setCurrentPage}
            selectedAppointmentIds={selectedAppointmentIds}
            currentAppointmentsLength={appointments.length}
            toggleSelectAll={toggleSelectAll}
            onClearFilters={handleClearFilters}
            hasSelection={selectedAppointmentIds.size > 0}
            clearSelection={clearSelection}
          />
          
          {/* Desktop */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm text-slate-400 font-medium border-b border-[#1f1f1f]">
              <div className="col-span-3 xl:col-span-2 flex items-center gap-3">
                <Checkbox
                  id="select-all-header"
                  checked={appointments.length > 0 && selectedAppointmentIds.size === appointments.length}
                  onCheckedChange={toggleSelectAll}
                  className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                Cliente
              </div>
              <div className="col-span-2">Serviço</div>
              <div className="col-span-2 flex items-center gap-3">
                <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                Data/Hora
              </div>
              <div className="col-span-2">Origem</div>
              <div className="col-span-1 xl:col-span-2">Barbeiro</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1"></div>
            </div>
            
            {loading ? (
              <div className="px-6 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500 mx-auto" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-slate-500">Nenhuma atividade recente encontrada.</p>
                {searchTerm || statusFilter !== 'all' || dateFilter.value ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 text-slate-400 border-slate-700 hover:bg-slate-800/50"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="divide-y divide-[#1f1f1f]">
                {appointments.map((appointment) => (
                  <DesktopAppointmentItem
                    key={appointment.id}
                    appointment={appointment}
                    toggleSelectOne={toggleSelectOne}
                    getStatusBadge={getStatusBadge}
                    getSourceDisplay={getSourceDisplay}
                    handleAction={handleAction}
                    selectedAppointmentIds={selectedAppointmentIds}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Mobile */}
          <div className="lg:hidden p-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500">Nenhuma atividade recente encontrada.</p>
                {searchTerm || statusFilter !== 'all' || dateFilter.value ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4 text-slate-400 border-slate-700 hover:bg-slate-800/50"
                    onClick={handleClearFilters}
                  >
                    Limpar filtros
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <MobileAppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    toggleSelectOne={toggleSelectOne}
                    getStatusBadge={getStatusBadge}
                    getSourceDisplay={getSourceDisplay}
                    handleAction={handleAction}
                    selectedAppointmentIds={selectedAppointmentIds}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#1f1f1f] gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} - {Math.min(currentPage * itemsPerPage, totalCount)} de {totalCount} agendamentos
              </span>
            </div>
            <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
              {renderPaginationItems}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* visualização/edição */}
      <AppointmentModal
        appointment={selectedAppointment}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAppointment}
        onDelete={handleDeleteAppointment}
        barbershopServices={barbershopServices}
        barbers={barbers}
        mode={modalMode}
      />

      {/* confirmação de exclusão */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => appointmentToDelete && handleDeleteAppointment(appointmentToDelete)}
        title="Excluir Agendamento"
        description="Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita."
      />
    </>
  )
}

export default AppointmentActivitySection;