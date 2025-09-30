import { SearchIcon } from "lucide-react";
import Header from "./_components/header";
import { Button } from "./_components/ui/button";
import { Input } from "./_components/ui/input";
import Image from "next/image";
import { Card, CardContent } from "./_components/ui/card";
import { Badge } from "./_components/ui/badge";
import { Avatar, AvatarImage } from "./_components/ui/avatar";
import { db } from "./_lib/prisma";
import BarbershopItem from "./_components/barbershop-item";
import { Barbershop } from "./generated/prisma";


const Home =  async () => {
  // chamar meu banco de dados
  const barbershops = await db.barbershop.findMany({})
  
  return <div>
    {/* header */}
    <Header />
    <div className="p-5">
      {/* TEXTO */}
      <h2 className="text-xl font-bold">Olá, Felipe!</h2>
      <p>Domingo, 28 de setembro.</p>

      {/* BUSCA */}
      <div className="flex items-center gap-2 mt-6">
      <Input placeholder="Faça sua busca..." />
      <Button>
        <SearchIcon></SearchIcon>
      </Button>
      </div>

      {/* IMAGEM */}
      <div className="relative w-full h-[150px] mt-6">
        <Image alt="Agende nos melhores com CNC Barber" src="/banner-01.png" fill className="object-cover rounded-xl"/>
      </div>

      {/* AGENDAMENTO */}
      <h2 className="mb-3 uppercase text-gray-400 font-bold text-xs mt-6">Agendamentos</h2>

      <Card>
        <CardContent className="flex justify-between p-0">
          {/* ESQUERDA */}
          <div className="flex flex-col gap-2 py-5 pl-5">
          <Badge className="w-fit">Confirmado</Badge>
          <h3 className="font-semibold">Corte de Cabelo</h3>

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src="https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png" />
            </Avatar>
            <p className="text-sm">Barbearia CNC</p>
          </div>
          </div>
          {/* DIREITA */}
          <div className="flex flex-col items-center justify-center px-5 border-l-2 border-solid">
            <p className="text-sm">Setembro</p>
            <p className="text-2xl">28</p>
            <p className="text-sm">20:00</p>
          </div>
        </CardContent>
      </Card>

      <h2 className="mb-3 uppercase text-gray-400 font-bold text-xs mt-6">Recomendados</h2>
      <div className="flex gap-4 overflow-auto [&::-webkit-scrollbar]:hidden">
          {barbershops.map((barbershop: Barbershop) => (
      <BarbershopItem key={barbershop.id} barbershop={barbershop} />
    ))}
      </div>
    </div>
  </div>
}

export default Home
