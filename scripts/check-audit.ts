import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function check() {
  const count = await prisma.auditLog.count()
  console.log(`Total: ${count}`)

  const logs = await prisma.auditLog.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true, email: true } } }
  })

  logs.forEach(log => {
    console.log(`${log.action} - ${log.user?.name || 'Sistema'}`)
  })

  await prisma.$disconnect()
}

check()
