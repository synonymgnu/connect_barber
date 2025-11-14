import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { statusConfig, AppointmentStatus } from "@/app/_constants/appointment-types";
import { X } from "lucide-react";

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
  onClearFilters: () => void;
  hasSelection: boolean;
  clearSelection: () => void;
}

const AppointmentFilterControls: React.FC<AppointmentFilterControlsProps> = ({
  statusFilter,
  setStatusFilter,
  itemsPerPage,
  setItemsPerPage,
  filterType,
  setFilterType,
  setCurrentPage,
  selectedAppointmentIds,
  onClearFilters,
  hasSelection,
  clearSelection
}) => {
  return (
    <div className="px-6 py-4 border-b border-[#1f1f1f]">

      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex overflow-x-auto pb-2 gap-2 [&::-webkit-scrollbar]:hidden">
          <Button
            variant={statusFilter === 'all' ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setFilterType("todos");
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
                setCurrentPage(1);
              }}
              className={`text-xs ${statusFilter === key ? "text-white" : "text-slate-400 border-slate-700 hover:bg-slate-800/50"}`}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Itens por página */}
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 whitespace-nowrap">Mostrar:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
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

          {hasSelection && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-slate-700 text-slate-400 hover:bg-slate-800/50 hover:text-white">
                Ações ({selectedAppointmentIds.size})
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearSelection}
                className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8 p-0"
                title="Limpar seleção"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-4">

        
        {(filterType !== "todos" || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50 whitespace-nowrap"
          >
            Limpar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentFilterControls;