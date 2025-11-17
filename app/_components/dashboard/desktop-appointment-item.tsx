import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { AppointmentProps } from "./appointment-activity-section";
import { UserAvatar } from "../ui/user-avatar"

interface DesktopAppointmentItemProps {
  appointment: AppointmentProps;
  toggleSelectOne: (id: string) => void;
  getStatusBadge: (status: AppointmentProps['status']) => React.ReactNode;
  getSourceDisplay: (source: AppointmentProps['source']) => React.ReactNode;
  handleAction: (action: string, id: string) => void;
  selectedAppointmentIds: Set<string>;
}

const DesktopAppointmentItem = ({ 
  appointment, 
  toggleSelectOne, 
  getStatusBadge, 
  getSourceDisplay,
  handleAction, 
  selectedAppointmentIds 
}: DesktopAppointmentItemProps) => {
    return (
        <div className={`grid grid-cols-12 items-center min-h-[56px] gap-4 px-6 py-4 hover:bg-[#151515] transition-colors ${
            selectedAppointmentIds.has(appointment.id) ? 'bg-[#8161FF]/10 ring-1 ring-[#8161FF]/30' : ''
        }`}>
            <div className="col-span-3 xl:col-span-2 flex items-center gap-3">
                <Checkbox
                    id={`select-${appointment.id}`}
                    checked={selectedAppointmentIds.has(appointment.id)}
                    onCheckedChange={() => toggleSelectOne(appointment.id)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <UserAvatar 
                    src={appointment.customerImageUrl} 
                    name={appointment.customerName}
                    size="md"
                />
                <div>
                    <p className="text-white font-medium text-sm">{appointment.customerName}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">{appointment.customerPhone}</p>
                </div>
            </div>
            <div className="col-span-2 flex flex-col">
                <p className="text-white text-sm">{appointment.type}</p>
                <p className="text-slate-400 text-xs">{appointment.duration}min | R$ {appointment.totalValue.toFixed(2)}</p>
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <span className="text-white text-sm">{appointment.date}</span>
            </div>
            {/* COLUNA ORIGEM */}
            <div className="col-span-2 flex items-center gap-2">
                {getSourceDisplay(appointment.source)}
            </div>
            <div className="col-span-1 xl:col-span-2 flex items-center">
                <p className="text-white text-sm">{appointment.employee}</p>
            </div>
            <div className="col-span-1 flex items-center">{getStatusBadge(appointment.status)}</div>
            <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0f0f0f] border-slate-700 text-slate-300">
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50" onClick={() => handleAction('view', appointment.id)}>
                            <Eye className="mr-2 h-4 w-4" />Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50" onClick={() => handleAction('edit', appointment.id)}>
                            <Edit className="mr-2 h-4 w-4" />Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:bg-red-900/20" onClick={() => handleAction('delete', appointment.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )
}

export default DesktopAppointmentItem;