"use client"

import { SearchIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

const Search = () => {
    const [search, setSearch] = useState("")
    const router = useRouter();


    const handLeSubmit = (e) => {
        e.preventDefault()
        router.push(`/barbershops?search=${search}`)
    }
    

    return ( 
    <form onSubmit={handLeSubmit} className="flex items-center gap-2">
        <Input
         placeholder="Faça sua busca..." 
         value={search} 
         onChange={(e) => setSearch(e.target.value)} 
         />
        <Button type="submit">
          <SearchIcon />
        </Button>
    </form> 
    );
}
 
export default Search;