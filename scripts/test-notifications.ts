import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testNotifications() {
  const client = await prisma.user.findFirst({
    where: { role: 'CLIENT' }
  })

  if (!client) {
    console.log('Nenhum cliente encontrado')
    return
  }

  console.log(`Cliente: ${client.email}`)

  const notifications = await prisma.notification.findMany({
    where: { userId: client.id },
    orderBy: { createdAt: 'desc' },
    take: 10
  })

  console.log(`\nNotificações (${notifications.length}):`)
  notifications.forEach(n => {
    console.log(`- [${n.type}] ${n.title}: ${n.message}`)
    console.log(`  Lida: ${n.isRead} | ${n.createdAt}`)
  })

  await prisma.$disconnect()
}

testNotifications()
