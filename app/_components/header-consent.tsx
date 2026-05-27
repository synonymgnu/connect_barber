import Image from 'next/image'
import { Card, CardContent } from './ui/card'
import Link from 'next/link'

const ConsentHeader = () => {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-7">
        <Link href="/">
          <Image
            alt="Connect Barber"
            src="/logo1.png"
            height={84}
            width={365}
          />
        </Link>
      </CardContent>
    </Card>
  )
}

export default ConsentHeader
