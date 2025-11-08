import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { statusConfig, AppointmentStatus } from "@/app/_constants/appointment-types";

interface AppointmentFilterControlsProps {
  statusFilter: keyof typeof statusConfig | 'all';
  setStatusFilter: (status: keyof typeof statusConfig | 'all') => void;
  itemsPerPage: number;
  setItemsPerPage: (num: number) => void;
  filterType: "dia" | "semana" | "mês" | "ano" | "todos";
  setFilterType: (type: "dia" | "semana" | "mês" | "ano" | "todos") => void;
  filterValue: Date | null;
  setFilterValue: (date: Date | null) => void;
  setCurrentPage: (page: number) => void;
  selectedAppointmentIds: Set<string>;
  currentAppointmentsLength: number;
  toggleSelectAll: () => void;
  onClearFilters: () => void; // Função para limpar filtros de data
}

interface AppointmentFilterControlsProps {
  statusFilter: AppointmentStatus | 'all';
  setStatusFilter: (status: AppointmentStatus | 'all') => void;
  itemsPerPage: number;
  setItemsPerPage: (num: number) => void;
  filterType: "dia" | "semana" | "mês" | "ano" | "todos";
  setFilterType: (type: "dia" | "semana" | "mês" | "ano" | "todos") => void;
  filterValue: Date | null;
  setFilterValue: (date: Date | null) => void;
  setCurrentPage: (page: number) => void;
  selectedAppointmentIds: Set<string>;
  currentAppointmentsLength: number;
  toggleSelectAll: () => void;
  onClearFilters: () => void;
}

const AppointmentFilterControls: React.FC<AppointmentFilterControlsProps> = ({
  statusFilter,
  setStatusFilter,
  itemsPerPage,
  setItemsPerPage,
  filterType,
  setFilterType,
  filterValue,
  setFilterValue,
  setCurrentPage,
  selectedAppointmentIds,
  currentAppointmentsLength,
  toggleSelectAll,
  onClearFilters,
}) => {
  return (
    <div className="px-6 py-4 border-b border-[#1f1f1f] flex flex-col gap-4">
      {/* Carrossel de Filtros e Controles */}
      <div className="flex overflow-x-auto pb-2 gap-4 [&::-webkit-scrollbar]:hidden">
        {/* Filtros de Status */}
        <div className="flex flex-nowrap gap-2">
          <Button
            variant={statusFilter === 'all' ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setFilterType("todos");
              setFilterValue(null);
              setCurrentPage(1);
            }}
            className={statusFilter === 'all' ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}
          >
            Todos
          </Button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={statusFilter === key ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setStatusFilter(key as AppointmentStatus);
                setFilterType("todos");
                setFilterValue(null);
                setCurrentPage(1);
              }}
              className={`text-xs ${statusFilter === key ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}`}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Controle de Itens por Página */}
        <div className="flex items-center gap-2 flex-nowrap">
          <span className="text-sm text-slate-400 whitespace-nowrap">Mostrar:</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setFilterType("todos");
              setFilterValue(null);
              setCurrentPage(1);
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
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-row items-center gap-2 lg:hidden">
          <Checkbox
            id="select-all-header"
            checked={selectedAppointmentIds.size === currentAppointmentsLength && currentAppointmentsLength > 0}
            onCheckedChange={toggleSelectAll}
            className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
          />
          <span className="text-sm text-center text-slate-500">
            Selecionar todos
          </span>
        </div>
        {(filterType !== "todos" || filterValue) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 whitespace-nowrap"
          >
            Limpar filtro
          </Button>
        )}
        {selectedAppointmentIds.size > 0 && (
          <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-white ml-auto">
            Ações ({selectedAppointmentIds.size})
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentFilterControls;