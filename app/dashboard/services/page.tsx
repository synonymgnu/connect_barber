import { getServices } from '@/app/_actions/get-services'
import { CreateServiceDialog } from '@/app/_components/dashboard/create-service-dialog'
import { AdminServiceItem } from '@/app/_components/dashboard/admin-service-item'

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
            <AdminServiceItem key={service.id} service={service} />
          ))}
        </div>
      </main>
    </>
  )
}
