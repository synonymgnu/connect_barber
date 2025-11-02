"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar as CalendarIcon, ChevronDown, MapPin, MoreHorizontal, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AppointmentProps {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  type: string
  date: string
  location: string
  status: 'completed' | 'pending' | 'cancelled' | 'confirmed'
  employee: string
  duration: number
  totalValue: number
}

const simulateAppointments: AppointmentProps[] = [
  {
    id: "R-0122544-10",
    customerName: "Adriana Mccoy",
    customerEmail: "adriana@email.com",
    customerPhone: "(11) 99999-9999",
    type: "Corte + Barba",
    date: "17 Sep 2023 - 14:30",
    location: "Street London, 123",
    status: "completed",
    employee: "João Silva",
    duration: 60,
    totalValue: 45.00
  },
  {
    id: "R-0122544-11",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  },
  {
    id: "R-0122544-12",
    customerName: "Violet Warren",
    customerEmail: "violet@email.com",
    customerPhone: "(11) 97777-7777",
    type: "Barba",
    date: "17 Sep 2023 - 16:00",
    location: "Street London, 123",
    status: "pending",
    employee: "Carlos Oliveira",
    duration: 30,
    totalValue: 25.00
  },
  {
    id: "R-0122544-13",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  },
  {
    id: "R-0122544-R1",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  },
  {
    id: "R-0122544-R2",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  },
  {
    id: "R-0122544-R3",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  },
  {
    id: "R-0122544-R4",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  },
  {
    id: "R-0122544-R5",
    customerName: "Brooklyn Simmons",
    customerEmail: "brooklyn@email.com",
    customerPhone: "(11) 98888-8888",
    type: "Corte Social",
    date: "17 Sep 2023 - 15:30",
    location: "Street London, 123",
    status: "confirmed",
    employee: "Maria Santos",
    duration: 45,
    totalValue: 35.00
  }
]

const statusConfig = {
  completed: { label: "Concluído", variant: "default" as const },
  confirmed: { label: "Confirmado", variant: "secondary" as const },
  pending: { label: "Pendente", variant: "outline" as const },
  cancelled: { label: "Cancelado", variant: "destructive" as const }
}

const AppointmentActivitySection = () => {
    const [appointments, setAppointments] = useState<AppointmentProps[]>(simulateAppointments);
    const [selectedAppointmentIds, setSelectedAppointmentIds] = useState<Set<string>>(new Set());
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"dia" | "semana" | "mês" | "ano" | "todos">("todos");
    const [filterValue, setFilterValue] = useState<Date | null>(null);
    const [statusFilter, setStatusFilter] = useState<keyof typeof statusConfig | 'all'>('all');
    const [itemsPerPage, setItemsPerPage] = useState<number>(5);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const toggleSelectAll = () => {
        if (selectedAppointmentIds.size === appointments.length) {
            setSelectedAppointmentIds(new Set());
        } else {
            setSelectedAppointmentIds(new Set(appointments.map(appointment => appointment.id)));
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

    // Estilos para as badge
    const getStatusBadge = (status: AppointmentProps['status']) => {
        const config = statusConfig[status];
        let badgeClassName = "";
        if (config.variant === "outline") {
            badgeClassName = "border border-slate-600 bg-[#6B21A8] text-[#D8B4F2] hover:text-white px-4 py-1 rounded-xl";
        } else if (config.variant === "destructive") {
            badgeClassName = "bg-red-900/30 text-red-400 border border-red-900/50 px-4 py-1 rounded-xl";
        } else if (config.variant === "secondary") {
            badgeClassName = "bg-blue-900/30 text-blue-400 border border-blue-900/50 px-4 py-1 rounded-xl";
        } else { 
             badgeClassName = "bg-emerald-900/30 text-emerald-400 border border-emerald-900/50 px-4 py-1 rounded-xl";
        }
        return <Badge variant="default" className={badgeClassName}>{config.label}</Badge>;
    };

    // Filtro por busca, Ano Mês Semana Dia e Status
     const filteredAndSearchedAppointments = useMemo(() => {
        // Verifica se duas datas compartilham a mesma semana
        const isSameWeek = (date1: Date, date2: Date) => {
            const startOfWeek = (d: Date) => {
                const date = new Date(d);
                const day = date.getDay(); // 0 = domingo
                const diff = date.getDate() - day + (day === 0 ? -6 : 1); // segunda-feira
                return new Date(date.setDate(diff));
            };

            const start1 = startOfWeek(date1);
            const start2 = startOfWeek(date2);
            return start1.getFullYear() === start2.getFullYear() &&
                start1.getMonth() === start2.getMonth() &&
                start1.getDate() === start2.getDate();
        };

        return appointments.filter(appt => {
            // Filtro de busca
            const matchesSearch =
                appt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appt.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                appt.type.toLowerCase().includes(searchTerm.toLowerCase());

            // Filtro de data
            let matchesDate = true;
            if (filterType !== "todos" && filterValue) {
                const apptDate = new Date(appt.date.replace(/(\d{2}) (\w{3}) (\d{4}) - (\d{2}):(\d{2})/, "$1 $2 $3 $4:$5:00"));
                if (isNaN(apptDate.getTime())) return false;

                const base = filterValue;
                switch (filterType) {
                    case "dia":
                        matchesDate =
                            apptDate.getDate() === base.getDate() &&
                            apptDate.getMonth() === base.getMonth() &&
                            apptDate.getFullYear() === base.getFullYear();
                        break;
                    case "semana":
                        matchesDate = isSameWeek(apptDate, base);
                        break;
                    case "mês":
                        matchesDate =
                            apptDate.getMonth() === base.getMonth() &&
                            apptDate.getFullYear() === base.getFullYear();
                        break;
                    case "ano":
                        matchesDate = apptDate.getFullYear() === base.getFullYear();
                        break;
                }
            }

            // Filtro de status
            const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;

            return matchesSearch && matchesDate && matchesStatus;
        });
    }, [appointments, searchTerm, filterType, filterValue, statusFilter]);

    // Paginação
    const totalPages = Math.ceil(filteredAndSearchedAppointments.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentAppointments = filteredAndSearchedAppointments.slice(startIndex, endIndex);

    // Função para gerar os botões de paginação
    const renderPaginationItems = () => {
        const items = [];
        const maxVisiblePages = 5; // Número máximo de páginas visíveis (excluindo primeira/última e ...)

        // Botão "Anterior"
        items.push(
            <Button
                key="prev"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="text-slate-400 border-slate-700 hover:bg-slate-800/50 disabled:opacity-50"
            >
                Anterior
            </Button>
        );

        // Botão da Primeira Página
        if (totalPages > 0) {
            items.push(
                <Button
                    key={1}
                    variant={currentPage === 1 ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    className={currentPage === 1 ? "bg-blue-600 text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                >
                    1
                </Button>
            );
        }

        // Pontos de reticência após a primeira página
        if (currentPage > 3) {
            items.push(<span key="ellipsis-start" className="px-2 text-slate-500">...</span>);
        }

        // Páginas centrais
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            if (i > 1 && i < totalPages) { // Garante que não adiciona 1 e totalPages de novo
                items.push(
                    <Button
                        key={i}
                        variant={currentPage === i ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(i)}
                        className={currentPage === i ? "bg-blue-600 text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                    >
                        {i}
                    </Button>
                );
            }
        }

        // Pontos de reticência antes da última página
        if (totalPages > 4 && currentPage < totalPages - 2) {
             items.push(<span key="ellipsis-end" className="px-2 text-slate-500">...</span>);
        }

        // Botão da Última Página (se for diferente da primeira)
        if (totalPages > 1) {
             items.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className={currentPage === totalPages ? "bg-blue-600 text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                >
                    {totalPages}
                </Button>
            );
        }

        // Botão "Próximo"
        items.push(
            <Button
                key="next"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="text-slate-400 border-slate-700 hover:bg-slate-800/50 disabled:opacity-50"
            >
                Próximo
            </Button>
        );

        return items;
    };

    return (
        <Card className="w-full bg-[#0c0c0c] border-[#1f1f1f]">
            <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4">
                <CardTitle className="text-xl font-semibold text-white">Atividade de Agendamentos</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    {/* Caixa de Busca */}
                    <div className="relative flex-1 min-w-[150px]">
                        <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            type="text"
                            placeholder="Buscar agendamentos..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1); // Resetar para a primeira página ao pesquisar
                            }}
                            className="pl-8 bg-[#0f0f0f] border-slate-700 text-white placeholder:text-slate-500 focus:ring-1 focus:ring-blue-500 w-full"
                        />
                    </div>

                    <Select
                        value={filterType}
                        onValueChange={(val) => {
                            setFilterType(val as typeof filterType);
                            setCurrentPage(1); // Resetar ao mudar filtro
                        }}
                    >
                        <SelectTrigger className="w-[120px] bg-[#0f0f0f] border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white">
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
                                className="bg-[#0f0f0f] border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white min-w-[180px]"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
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
                                    setCurrentPage(1); // Resetar ao selecionar data
                                }}
                                locale={ptBR}
                                className="bg-[#0f0f0f] text-white"
                            />
                        </PopoverContent>
                    </Popover>

                    
                </div>
            </CardHeader>
            <CardContent className="p-0">

                {/* Barra de Controles Acima da Tabela - Adicionando Filtros de Status */}
                <div className="px-6 py-4 border-b border-[#1f1f1f] flex flex-wrap items-center gap-4">
                    {/* Filtros de Status */}
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant={statusFilter === 'all' ? "secondary" : "outline"}
                            size="sm"
                            onClick={() => {
                                setStatusFilter('all');
                                setCurrentPage(1); // Resetar ao mudar filtro
                            }}
                            className={statusFilter === 'all' ? "bg-blue-600 text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                        >
                            Todos
                        </Button>
                        {Object.entries(statusConfig).map(([key, config]) => (
                            <Button
                                key={key}
                                variant={statusFilter === key ? "secondary" : "outline"}
                                size="sm"
                                onClick={() => {
                                    setStatusFilter(key as keyof typeof statusConfig);
                                    setCurrentPage(1); // Resetar ao mudar filtro
                                }}
                                className={statusFilter === key ? "bg-blue-600 text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                            >
                                {config.label}
                            </Button>
                        ))}
                    </div>

                    {/* Controle de Itens por Página */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">Mostrar:</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                setItemsPerPage(Number(value));
                                setCurrentPage(1); // Resetar para a primeira página ao mudar o número de itens
                            }}
                        >
                            <SelectTrigger className="w-[70px] bg-[#0f0f0f] border-slate-700 text-slate-300">
                                <SelectValue placeholder="10" />
                            </SelectTrigger>
                            <SelectContent className="bg-[#0f0f0f] border-slate-700 text-slate-300">
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {(filterType !== "todos" || filterValue) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setFilterType("todos");
                                setFilterValue(null);
                                setCurrentPage(1); // Resetar ao limpar filtro
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800/50 whitespace-nowrap"
                        >
                            Limpar filtro
                        </Button>
                    )}

                    {selectedAppointmentIds.size > 0 && (
                        <Button variant="outline" size="sm" className="bg-blue-900/20 border-blue-700 text-blue-400 hover:bg-blue-900/30 ml-auto">
                            Ações ({selectedAppointmentIds.size})
                        </Button>
                    )}
                </div>

                {/* Tabela de Agendamentos */}
                <div className="space-y-0">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm text-slate-400 font-medium border-b border-[#1f1f1f]">
                        <div className="col-span-2 flex items-center gap-3">
                            <Checkbox
                                id="select-all-header"
                                checked={selectedAppointmentIds.size === currentAppointments.length && currentAppointments.length > 0}
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
                        <div className="col-span-2 flex items-center gap-3">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            Local
                        </div>
                        <div className="col-span-2">Barbeiro</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1"></div>
                    </div>

                    {currentAppointments.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                             <p className="text-slate-500">Nenhuma atividade recente encontrada.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#1f1f1f]">
                            {currentAppointments.map((appointment) => (
                                <div
                                    key={appointment.id}
                                    className={`grid grid-cols-12 items-center min-h-[56px] gap-4 px-6 py-4 hover:bg-[#151515] transition-colors ${
                                        selectedAppointmentIds.has(appointment.id) ? `duration-300 shadow-[0_0_15px_5px_rgba(255,255,255,0.3)]` : ''
                                    }`}
                                >
                                    {/* Cliente */}
                                    <div className="col-span-2 flex items-center gap-3">
                                        <Checkbox
                                            id={`select-${appointment.id}`}
                                            checked={selectedAppointmentIds.has(appointment.id)}
                                            onCheckedChange={() => toggleSelectOne(appointment.id)}
                                            className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                        />
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {appointment.customerName.split(' ').map(n => n[0]).join('')}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">
                                                {appointment.customerName}
                                            </p>
                                            <p className="text-xs text-slate-400 truncate max-w-[120px]">
                                                {appointment.customerPhone}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Serviço */}
                                    <div className="col-span-2 flex flex-col">
                                        <p className="text-white text-sm">{appointment.type}</p>
                                        <p className="text-slate-400 text-xs">
                                            {appointment.duration}min | R$ {appointment.totalValue.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Data/Hora */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span className="text-white text-sm">{appointment.date}</span>
                                    </div>

                                    {/* Local */}
                                    <div className="col-span-2 flex items-center gap-2">
                                        <span className="text-white text-sm truncate max-w-[125px]">{appointment.location}</span>
                                    </div>

                                    {/* Barbeiro */}
                                    <div className="col-span-2 flex items-center">
                                        <p className="text-white text-sm">{appointment.employee}</p>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1 flex items-center">
                                         {getStatusBadge(appointment.status)}
                                    </div>

                                    {/* ... */}
                                    <div className="col-span-1 flex justify-end">
                                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8 rounded-full">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer com paginação e contagem */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#1f1f1f] gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-400">
                            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSearchedAppointments.length)} de {filteredAndSearchedAppointments.length} agendamentos
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400">por página</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        {renderPaginationItems()}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default AppointmentActivitySection;