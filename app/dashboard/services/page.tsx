import HeaderAdmin from '@/app/_components/dashboard/header-admin'
import { Button } from '@/app/_components/ui/button'
import { Card, CardContent } from '@/app/_components/ui/card'

const ServicesPage = () => {
  return (
    <div className="lg:flex lg:h-screen">
      <HeaderAdmin />
      <main className="flex-1 overflow-y-auto m-10 ">
        <div className="flex gap-7">
          <h1 className="font-bold text-2xl">Serviços</h1>
          <Button>Cadastrar novo</Button>
        </div>

        <div className="mt-7">
          <Card>
            <CardContent className="justify-between flex pt-6">
              <div className="flex gap-2">
                imagem
                <h2 className="font-semibold">Corte normal</h2>
              </div>
              <p className="text-primary font-bold">R$45,00</p>
            </CardContent>
          </Card>
          <Card className="mt-7">
            <CardContent className="justify-between flex pt-6">
              <div className="flex gap-2">
                imagem
                <h2 className="font-semibold">Corte e barba</h2>
              </div>
              <p className="text-primary font-bold">R$70,00</p>
            </CardContent>
          </Card>

          <Card className="mt-7">
            <CardContent className="justify-between flex pt-6">
              <div className="flex gap-2">
                imagem
                <h2 className="font-semibold">Barba</h2>
              </div>
              <p className="text-primary font-bold">R$20,00</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default ServicesPage
