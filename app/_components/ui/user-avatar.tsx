import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/_components/ui/avatar"

interface UserAvatarProps {
  src?: string | null
  name: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function UserAvatar({ src, name, className = "", size = "md" }: UserAvatarProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base"
  }

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage 
        src={src || "/User.png"}
        alt={name}
        asChild
      >
        <Image src={src || "/User.png"} alt={name} fill className="object-cover" />
      </AvatarImage>
      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}