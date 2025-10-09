import { db } from "@/app/_lib/prisma";
import { ChevronLeftIcon, MapPinIcon, MenuIcon, StarIcon } from "lucide-react";
import Image from 'next/image';
import { Button } from '../../_components/ui/button';
import Link from "next/link"




interface BarbershopPageProps {
    params : {
        id: string
    }
}

const BarbershopPage = async ({ params }) => {
    //chamar o banco de dados
    const barbershop = await db.barbershop.findUnique({
        where: {
            id: params.id
        }
    })
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
            <div className=" mb-2 flex items-center gap-1">
                <MapPinIcon className="text-primary" size={18}/>
                <p>{barbershop.address}</p>
            </div>

            <div className="flex items-center gap-1">
                <StarIcon className="text-primary fill-primary"size={18} />
                <p className="text-sm"> 5,0 (499 Avaliações)</p>
            </div>
        </div>

        {/*DESCRIÇÃO*/}
        <div className="p-5">
            <p>{barbershop?.description}</p>
        </div>
    </div>
}
 
export default BarbershopPage;