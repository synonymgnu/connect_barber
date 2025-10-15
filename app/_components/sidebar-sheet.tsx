"use client"

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { signIn } from "next-auth/react"


const SidebarSheet = () => {
    const handLeLoginWithGoogleClick = () => signIn("google")
      



    return ( <Sheet>
          <SheetTrigger asChild>
            <Button className="md:hidden" size="icon" variant="outline">
          <MenuIcon />
        </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
      <SheetTitle className="text-left">Menu</SheetTitle>
    </SheetHeader>
          <div className="py-5 flex item-center justify-between border-b border-solid gap-3">
            <h2 className="font-bold">Olá, faça seu login!</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon">
              <LogInIcon />
            </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <DialogHeader>
            <DialogTitle>Faça login na plataforma</DialogTitle>
            <DialogDescription>
             Conecte-se usando sua conta do Google.
            </DialogDescription>
          </DialogHeader>

          <Button variant="outline" className="gap-1 font-bold" onClick={handLeLoginWithGoogleClick}>
            <Image 
             alt="Fazer login com o Google"
             src="/google.svg" 
             width={18} 
             height={18} 
             />
            Google
            </Button>
              </DialogContent>
            </Dialog>
            {/* <Avatar>
              <AvatarImage src={"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880"}/>
            </Avatar>
            <div className="flex flex-col ml-3">
              <p className="font-bold">Felipe Dourado de Carvalho</p>
              <p className="text-xs">felipedourado@cncbarber.io</p>
            </div> */}
          </div>
          
          <div className="py-5 flex flex-col gap-2 border-b border-solid">
            <SheetClose asChild>
              <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/">
              <HomeIcon size={18} />
              Início
              </Link>
              </Button>
            </SheetClose>
            <Button className="justify-start gap-2" variant="ghost">
              <CalendarIcon size={18} />
              Agendamentos
              </Button>
          </div>

          <div className="py-5 flex flex-col gap-2 border-b border-solid">
            {quickSearchOptions.map((option) => 
            <Button 
            key={option.title}
            className="justify-start gap-2" 
            variant="ghost">
              <Image
              alt={option.title}
              src={option.imageUrl} 
              height={18} 
              width={18} 
              />
              {option.title}
              </Button> )}
          </div>

          <div className="py-5 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start gap-2">
              <LogOutIcon size={18}/>
              Sair da Conta
              </Button>
          </div>

          </SheetContent>
        </Sheet> );
}
 
export default SidebarSheet;