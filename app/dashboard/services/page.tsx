import { getServices } from '@/app/_actions/get-services'
import { EditServiceDialog } from '@/app/_components/dashboard/edit-service-dialog'
import { DeleteServiceButton } from '@/app/_components/dashboard/delete-service-button'
import { Card, CardContent } from '@/app/_components/ui/card'
import Image from 'next/image'
import { CreateServiceDialog } from '@/app/_components/dashboard/create-service-dialog'

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <main className="overflow-y-auto">
        <div className="flex gap-7 justify-between">
          <h1 className="font-bold text-xl lg:text-2xl">Serviços</h1>
          <CreateServiceDialog />
        </div>

        <div className="mt-7 gap-7  grid grid-cols-1 lg:grid-cols-2">
          {services.map((service) => (
            <Card key={service.id}>
              <CardContent className="flex items-center gap-3 p-3">
                <div className="relative max-h-[110px] min-h-[110px] min-w-[110px] max-w-[110px]:">
                  <Image
                    alt={service.name}
                    src={service.imageUrl}
                    fill
                    className="object-cover rounded-lg "
                  />
                </div>
                {/* DIREITA */}
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
                  {/* PREÇO E BOTÃO  */}
                  <div className="flex items-center justify-between mt-2">
                    <p className="font-bold text-sm text-primary lg:text-base">
                      {Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(Number(service.price))}
                    </p>
                    <div className="flex gap-2">
                      <EditServiceDialog service={service} />
                      <DeleteServiceButton id={service.id} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  )
}
