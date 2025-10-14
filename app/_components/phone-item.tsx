"use client"

import { SmartphoneIcon } from "lucide-react"
import { Button } from "./ui/button"
import { toast } from "sonner"

interface PhoneItemProps {
    phone: string
}

const PhoneItem = ({ phone}: PhoneItemProps) => {
    const handleCopyPhoneClick = (phone: string) => {
        navigator.clipboard.writeText(phone)
        toast.success("Telefone copiado com sucesso!")
    }
    return ( <div className="flex justify-between" key={phone}>
                {/*ESQUERDA*/}
                <div className="flex items-center gap-2">
                    <SmartphoneIcon />
                    <p className="text-sm">{phone}</p>
                </div>
                {/*DIREITA*/}
                {/* MOBILE */}
                <Button
                variant="outline"
                size="sm"
                className="md:hidden"
                onClick={() => navigator.clipboard.writeText(phone)}
                >
                Copiar
                </Button>

                {/* DESKTOP */}
                <Button
                variant="secondary"
                size="sm"
                className="hidden md:flex"
                onClick={() => navigator.clipboard.writeText(phone)}
                >
                Copiar
                </Button>
                </div>
)}
 
export default PhoneItem;
