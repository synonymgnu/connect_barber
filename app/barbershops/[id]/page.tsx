import { db } from "@/app/_lib/prisma";
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react";
import Image from 'next/image';
import { Button } from '../../_components/ui/button';
import Link from "next/link"
import { notFound } from "next/navigation";
import ServiceItem from "@/app/_components/service-item";




interface BarbershopPageProps {
    params : {
        id: string
    }
}

const BarbershopPage = async ({ params }) => {
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
        {/* IMAGEM */}
        <div className="relative h-[250px] w-full">
            <Image 
            alt={barbershop.name}
            src={barbershop?.imageUrl} 
            fill 
            className="object-cover"
            />

            <Button 
            size="icon" 
            variant="secondary" 
            className="absolute left-4 top-4 "
            asChild
            >
             <Link href="/">
                <ChevronLeftIcon />
                </Link>
             </Button>
                
                <Button 
            size="icon" 
            variant="secondary" 
            className="absolute right-4 top-4 "
            >
                <MenuIcon />
                
            </Button>

        </div>
        <div className="p-5 border-b border-solid">
            <h1 className="text-xl font-bold mb-3">{barbershop.name}</h1>
            <div className=" mb-2 flex items-center gap-2">
                <MapPinIcon className="text-primary" size={18}/>
                <p>{barbershop.address}</p>
            </div>

            <div className="flex items-center gap-2">
                <StarIcon className="text-primary fill-primary"size={18} />
                <p className="text-sm"> 5,0 (499 Avaliações)</p>
            </div>
        </div>

        {/*DESCRIÇÃO*/}
        <div className="p-5 border-b border-solid space-y-3 ">
            <h2 className="font-bold uppercase text-gray-400 text-xs">Sobre nós</h2>
            <p className="text-sn text-justify">{barbershop?.description}</p>
        </div>

        <div className="p-5 space-y-3">
        <h2 className="font-bold uppercase text-gray-400 text-xs mb-3">Serviços</h2>
        <div className="space-y-3">
        {barbershop.services.map((service => (
            <ServiceItem key={service.id} service={service}/>
        )))}
        </div>
        </div>
    </div>
}
 
export default BarbershopPage;