import { SearchIcon } from "lucide-react";
import Header from "./_components/header";
import { Button } from "./_components/ui/button";
import { Input } from "./_components/ui/input";
import Image from "next/image";


const Home = () => {
  return <div>
    {/* header */}
    <Header />
    <div className="p-5">
      <h2 className="text-xl font-bold">Olá, Felipe!</h2>
      <p>Domingo, 28 de setembro.</p>

      <div className="flex items-center gap-2 mt-6">
      <Input placeholder="Faça sua busca..." />
      <Button>
        <SearchIcon></SearchIcon>
      </Button>
      </div>

      <div className="relative w-full h-[150px] mt-6">
        <Image alt="Agende nos melhores com CNC Barber" src="/banner-01.png" fill className="object-cover rounded-xl"/>
      </div>
    </div>
  </div>
}

export default Home
