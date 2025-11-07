import { Checkbox } from "../ui/checkbox";
import { CalendarIcon, Clock, Edit, Eye, MapPin, MoreHorizontal, Phone, Trash2, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";

const MobileAppointmentCard = ({...props }) => {

    return (
            <div className={`p-4 border border-[#1f1f1f] rounded-lg mb-3 transition-all ${
        props.selectedAppointmentIds.has(props.appointment.id) 
            ? 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 ring-1 ring-blue-500/30' 
            : 'bg-[#0f0f0f] hover:bg-[#151515]'
    }`}>
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
                <Checkbox
                    id={`select-mobile-${props.appointment}`}
                    checked={props.selectedAppointmentIds.has(props.appointment.id)}
                    onCheckedChange={() => props.toggleSelectOne(props.appointment.id)}
                    className="border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white mt-1"
                />
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {props.appointment.customerName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white font-medium text-sm truncate">
                        {props.appointment.customerName}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        <span className="text-xs text-slate-400 truncate">
                            {props.appointment.customerPhone}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white h-8 w-8">
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
        
        {/* Detalhes do Serviço */}
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />
                    <span className="text-white text-sm font-medium">{props.appointment.type}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-white text-sm">R$ {props.appointment.totalValue.toFixed(2)}</span>
                </div>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{props.appointment.duration}min</span>
                </div>
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-400 text-sm">{props.appointment.date.split(' - ')[0]}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400 text-sm truncate flex-1">{props.appointment.location}</span>
            </div>
            <div className="pt-2 border-t border-[#1f1f1f]">
                <span className="text-slate-400 text-sm">Barbeiro: </span>
                <span className="text-white text-sm">{props.appointment.employee}</span>
            </div>
            <div className="relative">
                <div className="absolute right-0 bottom-1">
                    {props.getStatusBadge(props.appointment.status)}
                </div>
            </div>
        </div>
    </div>
    );
};

export default MobileAppointmentCard;