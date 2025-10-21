import { db } from "@/app/_lib/prisma";
import { ChevronLeftIcon, MapPinIcon, StarIcon } from "lucide-react";
import Image from 'next/image';
import { Button } from '../../_components/ui/button';
import Link from "next/link"
import { notFound } from "next/navigation";
import ServiceItem from "@/app/_components/service-item";
import PhoneItem from "@/app/_components/phone-item";
import { Sheet, SheetTrigger } from "@/app/_components/ui/sheet";
import SidebarSheet from "@/app/_components/sidebar-sheet";
import Header from "@/app/_components/header";
import { Card } from "@/app/_components/ui/card";
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar";




interface BarbershopPageProps {
    params : {
        id: string
    }
}

const BarbershopPage = async ({ params }: BarbershopPageProps) => {

    //chamar o banco de dados
    const barbershop = await db.barbershop.findUnique({
        where: {
            id: params.id,
        },
        include: {

            services: true,
        }
    })

    if (!barbershop) {
        return notFound()

    }

    return <div>
        <div className="hidden md:block">
        <Header  />
        </div>

{/* CONTAINER GERAL */}
<div className="md:flex md:gap-8 md:ml-32 md:mr-32 md:mt-10 md:min-w-[758px]">
    {/* COLUNA ESQUERDA */}
    <div className="md:w-3/4">
            {/* IMAGEM */}
            <div className="relative h-[250px] w-full md:h-[487px] overflow-hidden">
            <Image 
            alt={barbershop.name}
            src={barbershop?.imageUrl} 
            fill 
            className="object-cover md:rounded-sm"
            />

            <Button 
            size="icon" 
            variant="secondary" 
            className="absolute left-4 top-4 md:hidden"
            asChild
            >
             <Link href="/">
                <ChevronLeftIcon />
                </Link>
             </Button>

            <Sheet>
                       <SheetTrigger asChild>
                        <Button
                       
                        size="icon"
                        variant="outline"
                        className="absolute right-4 top-4 md:hidden"
                        >
                        
                        <SidebarSheet />
                        </Button>
                       </SheetTrigger>

            </Sheet>
                
            </div>
    {/* NOME, ENDEREÇO E AVALIAÇÃO */}
    <div className="p-5 border-b  md:flex md:items-center md:justify-between md:p-0 md:mt-5 md:border-b-0">
    {/* BLOCO ESQUERDA */}
    <div>
        <h1 className="text-xl font-bold mb-3 md:text-3xl">{barbershop.name}</h1>
        <div className=" mb-2 flex items-center gap-2 md:mb-0">
        <MapPinIcon className="text-primary" size={18}/>
        <p className="text-sm md:text-base text-zinc-300">{barbershop.address}</p>
        </div>
    </div>
    {/* BLOCO DIREITA (AVALIAÇÃO) */}
    <Card className="hidden md:block border-0">
    <div className="hidden md:flex flex-col items-center px-5 py-2.5">
  <div className="flex items-center gap-2">
    <StarIcon className="text-primary fill-primary" size={20} />
    <p className="text-sm md:text-xl font-medium">5,0</p>
  </div>
  <p className="text-xs mt-2">889 avaliações</p>
</div>
    </Card>
        {/* AVALIAÇÃO MOBILE */}
        <div className="flex items-center gap-2 md:hidden">
        <StarIcon className="text-primary fill-primary"size={18} />
         <p className="text-sm"> 5,0 (499 Avaliações)</p>
        </div>
    </div>

    {/*DESCRIÇÃO - SOMENTE MOBILE*/}
    <div className="p-5 border-b border-solid space-y-3 md:hidden">
    <h2 className="font-bold uppercase text-gray-400 text-xs">Sobre nós</h2>
    <p className="text-sn text-justify">{barbershop?.description}</p>
    </div>
    {/* SERVIÇOS*/}
    <div className="p-5 space-y-3 border-b border-solid md:p-0 md:mt-10">
        <h2 className="font-bold uppercase text-gray-400 text-xs mb-3 md:text-sm">Serviços</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4 md:gap-x-5 md:gap-y-3">
        {barbershop.services.map((service => (
        <ServiceItem 
        key={service.id} 
        barbershop={JSON.parse(JSON.stringify(barbershop))} 
        service={JSON.parse(JSON.stringify(service))}/>
        )))}
        </div>
    </div>
    </div>
    {/* COLUNA DIREITA (DESKTOP) */}
    <Card className="hidden md:block md:w-1/4 border-0 self-start">
        <div className="p-5 space-y-5">
            {/* SOBRE NÓS - SOMENTE DESKTOP */}
            <div>
            <div className="relative h-[180px] w-full mb-5">
            {/* MAPA*/}
            <Image
            alt="Mapa"
            src="/map.png"
            fill
            className="rounded-xl object-cover"
            />
            {/* CARD SOBRE O MAPA */}
            <Card className="truncate absolute bottom-4 left-1/2 transform -translate-x-1/2 rounded-2xl px-2 flex items-center gap-1 h-[35%] md:w-[90%] shadow-lg">
                <Avatar className="h-6 w-6">
                <AvatarImage 
			    alt={barbershop.name}
            	src={barbershop?.imageUrl} 
            	fill />
                </Avatar>
                <div>
                <h3 className="text-white font-semibold text-base">{barbershop.name}</h3>
                <p className="text-zinc-400 text-xs">{barbershop.address}</p>
                </div>
            </Card>
            </div>

            

            <h2 className="font-bold uppercase text-sm mb-2.5">
                Sobre nós
            </h2>
            <p className="text-sm text-zinc-300 text-justify border-b pb-5">
            {barbershop.description}
            </p>
            </div>
    {/*CONTATO SOMENTE DESKTOP */}
    <div className="hidden md:block space-y-2.5">
    {barbershop.phone.map(phone => (
    <PhoneItem key={phone} phone={phone} />
    ))}
    </div>
            {/*DIAS E HORÁRIOS*/}
            <div className="text-xs  border-t border-zinc-800 pt-3 space-y-1">
        
              <div className="flex justify-between">
            <p className="text-zinc-500">Segunda</p>
            <p>Fechado</p>
            </div>
            <div className="flex justify-between">
            <p  className="text-zinc-500">Terça-Feira</p>
            <p>09:00 - 21:00</p>
            </div>
            <div className="flex justify-between">
            <p  className="text-zinc-500">Quarta-Feira</p>
            <p>09:00 - 21:00</p>
            </div>
            <div className="flex justify-between">
            <p  className="text-zinc-500">Quinta-Feira</p>
            <p>09:00 - 21:00</p>
            </div>
            <div className="flex justify-between">
            <p  className="text-zinc-500">Sexta-Feira</p>
            <p>09:00 - 21:00</p>
            </div>
            <div className="flex justify-between">
            <p  className="text-zinc-500">Sábado</p>
            <p>08:00 - 17:00</p>
            </div>
            <div className="flex justify-between">
            <p>Domingo</p>
            <p>Fechado</p>
            </div>
              
            </div>

            <div className="flex items-center justify-between">
                <p className="text-xs">Em parceria com</p>
                <Image alt="CNC Barber" src="/logo1.png" height={10} width={100} />
            </div>

        </div>
    </Card>
    {/*CONTATOS SOMENTE MOBILE*/}
    <div className="p-5 space-y-3 md:hidden">
    {barbershop.phone.map(phone => (
    <PhoneItem key={phone} phone={phone} />
    ))}
        </div>
    </div>
</div>
}
 
export default BarbershopPage;