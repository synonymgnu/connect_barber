"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  Calendar as CalendarIcon, 
  ChevronDown,
  Search, 
  Loader2,
  X
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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

interface AppointmentProps {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  type: string;
  date: string;
  source: 'PRESENCIAL' | 'ONLINE';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  employee: string;
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
  PRESENCIAL: { label: 'Presencial', color: 'text-[#8161FF]' },
  ONLINE: { label: 'Online', color: 'text-orange-500' }
}

const AppointmentActivitySection = () => {
  const [appointments, setAppointments] = useState<AppointmentProps[]>([]);
  const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"dia" | "semana" | "mês" | "ano" | "todos">("todos");
  const [filterValue, setFilterValue] = useState<Date | null>(null);
  const [statusFilter, setStatusFilter] = useState<keyof typeof statusConfig | 'all'>('all');
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    return (
      <div className={`flex items-center gap-2 ${config.color}`}>
        <span className="text-sm">{config.label}</span>
      </div>
    );
  };

  const handleAction = (action: string, id: string) => {
    console.log(`Ação: ${action} para o agendamento:`, id);
  };

  const handleClearFilters = () => {
    setFilterType("todos");
    setFilterValue(null);
    setStatusFilter('all');
    setSearchTerm("");
    setCurrentPage(1);
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('pageSize', itemsPerPage.toString());
      
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      let dateFilter = 'all';
      if (filterType !== 'todos' && filterValue) {
        switch (filterType) {
          case 'dia': dateFilter = 'today'; break;
          case 'semana': dateFilter = 'week'; break;
          case 'mês': dateFilter = 'month'; break;
        }
      }
      if (dateFilter !== 'all') params.append('dateFilter', dateFilter);

      const response = await fetch(`/api/appointments/activity?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Erro ao carregar agendamentos');
      }

      const data = await response.json();
      setAppointments(data.data || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Erro ao carregar agendamentos');
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, filterType, filterValue]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const renderPaginationItems = () => {
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
  };

  return (
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
                value={filterType}
                onValueChange={(val) => {
                  setFilterType(val as typeof filterType);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[140px] bg-[#0f0f0f] border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white">
                  <SelectValue placeholder="Filtrar por..." />
                </SelectTrigger>
                <SelectContent className="bg-[#0f0f0f] border-slate-700 text-slate-300">
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="dia">Dia</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mês">Mês</SelectItem>
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
                    {filterValue ? format(filterValue, "dd 'de' MMMM yyyy", { locale: ptBR }) : "Selecionar data"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#0f0f0f] border-slate-700">
                  <Calendar
                    mode="single"
                    selected={filterValue ?? undefined}
                    onSelect={(date) => {
                      setFilterValue(date ?? null);
                      setCurrentPage(1);
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
          filterType={filterType}
          setFilterType={setFilterType}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          setCurrentPage={setCurrentPage}
          selectedAppointmentIds={selectedAppointmentIds}
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
              {searchTerm || statusFilter !== 'all' || filterValue ? (
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
              {searchTerm || statusFilter !== 'all' || filterValue ? (
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
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, appointments.length)} de {appointments.length} agendamentos
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
            {renderPaginationItems()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AppointmentActivitySection;