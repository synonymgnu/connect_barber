"use client"

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar as CalendarIcon, ChevronDown, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
import { AppointmentProps, statusConfig } from "@/app/_constants/appointment-types";

// Adicionar lógica para ...


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
  },
  {
    id: "R-0122544-14",
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
    id: "R-0122544-15",
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
    id: "R-0122544-16",
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
    id: "R-0122544-17",
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
    id: "R-0122544-18",
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
    id: "R-0122544-19",
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
    id: "R-0122544-20",
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
    id: "R-0122544-21",
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
    id: "R-0122544-22",
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
    id: "R-0122544-23",
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
    id: "R-0122544-24",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "cancelled",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  },
  {
    id: "R-0122544-25",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "cancelled",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  },
  {
    id: "R-0122544-26",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "cancelled",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  },
  {
    id: "R-0122544-27",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "cancelled",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  },
  {
    id: "R-0122544-28",
    customerName: "Cody Fisher",
    customerEmail: "cody@email.com",
    customerPhone: "(11) 96666-6666",
    type: "Corte + Luzes",
    date: "17 Sep 2023 - 17:00",
    location: "Street London, 123",
    status: "cancelled",
    employee: "Ana Costa",
    duration: 90,
    totalValue: 80.00
  }
]

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
    // Verificar se todos os agendamentos estão selecionados
    if (selectedAppointmentIds.size === filteredAndSearchedAppointments.length && 
        filteredAndSearchedAppointments.every(appt => selectedAppointmentIds.has(appt.id))) {
        // Desseleciona se sim
        setSelectedAppointmentIds(new Set());
    } else {
        // Seleciona todos filtrados se não
        const allFilteredIds = new Set(filteredAndSearchedAppointments.map(appointment => appointment.id));
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

    // Estilos badge
    const getStatusBadge = (status: AppointmentProps['status']) => {
        const config = statusConfig[status];
        return (
            <Badge 
                variant="default" 
                className={`${config.color} px-3 py-1 rounded-xl text-xs sm:text-sm border`}
            >
                {config.label}
            </Badge>
        );
    };

    // ...
    const handleAction = (action: string, id: string) => {
        const appointment = appointments.find(appt => appt.id === id);
        console.log(`Ação: ${action} para o agendamento:`, appointment);

        switch (action) {
            case 'view':

                break;
            case 'edit':

                break;
            case 'delete':

                break;
            default:
                break;
        }
    };

    const handleClearFilters = () => {
        setFilterType("todos");
        setFilterValue(null);
        setCurrentPage(1);
    };

    // Filtro por Busca, Ano Mês Semana Dia e Status
     const filteredAndSearchedAppointments = useMemo(() => {
        // Faz uma verifiação se duas datas compartilham a mesma semana
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

    const renderPaginationItems = () => {
        const items = [];

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

        // Mostra a primeira página
        if (totalPages > 0) {
            items.push(
                <Button
                    key={1}
                    variant={currentPage === 1 ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    className={currentPage === 1 ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                >
                    1
                </Button>
            );
        }

        // Gerar botões de página
        const visiblePageCount = 7;

        const halfVisible = Math.floor(visiblePageCount / 2);

        let startPage = Math.max(2, currentPage - halfVisible); // página 2
        let endPage = Math.min(totalPages - 1, currentPage + halfVisible); // penúltima página

        if (currentPage <= halfVisible) {
            endPage = Math.min(totalPages - 1, visiblePageCount - 1);
        }

        if (currentPage > totalPages - halfVisible) {
            startPage = Math.max(2, totalPages - visiblePageCount + 1);
        }

        // Adiciona os botões
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Button
                    key={i}
                    variant={currentPage === i ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(i)}
                    className={currentPage === i ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
                >
                    {i}
                </Button>
            );
        }

        // Adiciona reticências
        if (endPage < totalPages - 1) {
            items.push(<span key="ellipsis-end" className="px-2 text-slate-500">...</span>);
        }
        if (totalPages > 1) {
            items.push(
                <Button
                    key={totalPages}
                    variant={currentPage === totalPages ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className={currentPage === totalPages ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
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
            <CardHeader className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between pb-2">
                <CardTitle className="text-xl font-semibold text-white">Atividade de Agendamentos</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">

                    {/* Caixa de Busca */}
                    <div className="relative flex-2 lg:flex-1 w-full min-w-[150px] m-0">
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

                        <div className="flex flex-col-2 justify-between lg:flex-row gap-2 w-full lg:mt-0">
                            <Select
                                value={filterType}
                                onValueChange={(val) => {
                                    setFilterType(val as typeof filterType);
                                    setCurrentPage(1);
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
                                        className="bg-[#0f0f0f] border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white w-full min-w-[180px] lg:w-[230px]"
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
                    currentAppointmentsLength={currentAppointments.length}
                    toggleSelectAll={toggleSelectAll}
                    onClearFilters={handleClearFilters}
                />

                {/* Agendamentos Desktop */}
                <div className="space-y-0 hidden lg:block">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 text-sm text-slate-400 font-medium border-b border-[#1f1f1f]">
                        <div className="col-span-3 xl:col-span-2 flex items-center gap-3">
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
                        <div className="col-span-1 xl:col-span-2">Barbeiro</div>
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
                                <DesktopAppointmentItem
                                    key={appointment.id}
                                    appointment={appointment}
                                    toggleSelectOne={toggleSelectOne}
                                    getStatusBadge={getStatusBadge}
                                    handleAction={handleAction}
                                    selectedAppointmentIds={selectedAppointmentIds}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Cards Mobile */}
                <div className="lg:hidden p-4">
                    {currentAppointments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-slate-500">Nenhuma atividade recente encontrada.</p>
                        </div>
                    ) : (
                        <div>
                            {currentAppointments.map((appointment) => (
                                <MobileAppointmentCard 
                                    key={appointment.id} 
                                    appointment={appointment}
                                    toggleSelectOne={toggleSelectOne}
                                    getStatusBadge={getStatusBadge}
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
                            Mostrando {startIndex + 1} - {Math.min(endIndex, filteredAndSearchedAppointments.length)} de {filteredAndSearchedAppointments.length} agendamentos
                        </span>
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