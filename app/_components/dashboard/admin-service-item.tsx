'use client'

import Image from 'next/image'
import { Card, CardContent } from '@/app/_components/ui/card'
import { EditServiceDialog } from '@/app/_components/dashboard/edit-service-dialog'
import { DeleteServiceButton } from '@/app/_components/dashboard/delete-service-button'
import { Clock2, MoreHorizontalIcon, SquarePen, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu'
import { Button } from '@/app/_components/ui/button'
import { useState } from 'react'

export function AdminServiceItem({ service }: any) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-3">
        <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]">
          <Image
            alt={service.name}
            src={service.imageUrl}
            fill
            className="object-cover rounded-lg"
          />
        </div>

        {/* RIGHT */}
        <div className="space-y-2 w-screen flex-1 min-w-0">
          <div className="marquee-container truncate">
            <span
              className={`marquee-text font-semibold text-sm lg:text-base ${
                service.name.length > 29 ? 'marquee-long' : ''
              }`}
              title={service.name}
            >
              {service.name}
            </span>
          </div>

          <p className="text-sm text-gray-400 line-clamp-2 break-words">
            {service.description}
          </p>

          {/* PRICE + DURATION + MENU */}
          <div className="flex items-center justify-between mt-2">
            <p className="font-bold text-sm text-primary lg:text-base">
              {Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(Number(service.price))}
            </p>

            <p className="flex items-center gap-[2px] text-xs text-gray-400">
              <Clock2 width={18} height={18} />
              {service.duration}min
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontalIcon />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="center">
                <DropdownMenuGroup className="items-center">
                  <DropdownMenuItem
                    onClick={() => setEditOpen(true)}
                    className="gap-2 items-center"
                  >
                    <SquarePen className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => setDeleteOpen(true)}
                    className="text-red-400 focus:bg-red-900/20 gap-2 items-center"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <EditServiceDialog
          service={service}
          open={editOpen}
          setOpen={setEditOpen}
        />
        <DeleteServiceButton
          id={service.id}
          open={deleteOpen}
          setOpen={setDeleteOpen}
        />
      </CardContent>
    </Card>
  )
}
