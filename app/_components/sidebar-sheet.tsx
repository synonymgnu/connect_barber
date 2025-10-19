"use client"

import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import { CalendarIcon, HomeIcon, LogInIcon, LogOutIcon, MenuIcon } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog"
import { signIn, signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage } from "./ui/avatar"
import SignInDialog from "./sign-in-dialog"


const SidebarSheet = () => {
  const {data} = useSession()
    const handLeLoginWithGoogleClick = () => signIn("google")
    const handLelogoutCLick = () =>signOut()
      



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
           

            
             {data?.user ? (
              <div className="flex items-center gap-2">
              <Avatar>
              <AvatarImage src={data?.user?.image ?? ""}/>
            </Avatar>
            <div className="flex flex-col ml-3">
              <p className="font-bold">{data.user.name}</p>
              <p className="text-xs">{data.user.email}</p>
            </div>
              </div>
             ) : (
              <>
               <h2 className="font-bold">Olá, faça seu login!</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="icon">
              <LogInIcon />
            </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <SignInDialog />
              </DialogContent>
            </Dialog>
              </>
             )}
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
            <SheetClose key={option.title} asChild>
              <Button 
            
            className="justify-start gap-2" 
            variant="ghost"
            asChild
            >

             <Link href={`/barbershops?service=${option.title}`}>
             <Image
              alt={option.title}
              src={option.imageUrl} 
              height={18} 
              width={18} 
              />
              {option.title}
             </Link>
              </Button> 
            </SheetClose>
            )}
          </div>

          {data?.user && (
            <div className="py-5 flex flex-col gap-2">
            <Button variant="ghost" className="justify-start gap-2" onClick={handLelogoutCLick}>
              <LogOutIcon size={18}/>
              Sair da Conta
              </Button>
          </div>
          )}

          </SheetContent>
        </Sheet> );
}
 
export default SidebarSheet;