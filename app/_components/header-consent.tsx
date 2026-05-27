import Image from 'next/image'
import { Card, CardContent } from './ui/card'

const ConsentHeader = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-7">
        <Image alt="Connect Barber" src="/logo1.png" height={84} width={365} />
      </CardContent>
    </Card>
  )
}

export default ConsentHeader
