import { signIn } from "next-auth/react";
import { Button } from "./ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import Image from "next/image";

const SignInDialog = () => {
    const handLeLoginWithGoogleClick = () => signIn("google")
    
    return ( 
        
    <>
    
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

    </>
              
     );
}
 
export default SignInDialog;