import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const DesktopAppointmentItem = ({... props}) => {

    return (
        <div
            key={props.appointment.id}
            className={`grid grid-cols-12 items-center min-h-[56px] gap-4 px-6 py-4 hover:bg-[#151515] transition-colors ${
                props.selectedAppointmentIds.has(props.appointment.id) ? `duration-300 shadow-[0_0_15px_5px_rgba(255,255,255,0.3)]` : ''
            }`}
        >
            <div className="col-span-3 xl:col-span-2 flex items-center gap-3">
                <Checkbox
                    id={`select-${props.appointment.id}`}
                    checked={props.selectedAppointmentIds.has(props.appointment.id)}
                    onCheckedChange={() => props.toggleSelectOne(props.appointment.id)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                />
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {props.appointment.customerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                    <p className="text-white font-medium text-sm">
                        {props.appointment.customerName}
                    </p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">
                        {props.appointment.customerPhone}
                    </p>
                </div>
            </div>
            <div className="col-span-2 flex flex-col">
                <p className="text-white text-sm">{props.appointment.type}</p>
                <p className="text-slate-400 text-xs">
                    {props.appointment.duration}min | R$ {props.appointment.totalValue.toFixed(2)}
                </p>
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <span className="text-white text-sm">{props.appointment.date}</span>
            </div>
            <div className="col-span-2 flex items-center gap-2">
                <span className="text-white text-sm truncate max-w-[125px]">{props.appointment.location}</span>
            </div>
            <div className="col-span-1 xl:col-span-2 flex items-center">
                <p className="text-white text-sm">{props.appointment.employee}</p>
            </div>
            <div className="col-span-1 flex items-center">
                    {props.getStatusBadge(props.appointment.status)}
            </div>
            {/* ... */}
            <div className="col-span-1 flex justify-end">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-800/50 h-8 w-8 rounded-full">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0f0f0f] border-slate-700 text-slate-300">
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50" onClick={() => props.handleAction('view', props.appointment.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-slate-300 focus:bg-slate-800/50" onClick={() => props.handleAction('edit', props.appointment.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:bg-red-900/20" onClick={() => props.handleAction('delete', props.appointment.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    )

}

export default DesktopAppointmentItem;