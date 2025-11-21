import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestLog() {
  const admin = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  })

  if (!admin) {
    console.log('Nenhum admin encontrado')
    await prisma.$disconnect()
    return
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'TEST_ACTION',
      resource: 'test',
      resourceId: 'test-123',
      ipAddress: '127.0.0.1',
      userAgent: 'Test Script',
      metadata: { test: true }
    }
  })

  console.log('Log de teste criado com sucesso!')
  
  const count = await prisma.auditLog.count()
  console.log(`Total de logs: ${count}`)

  await prisma.$disconnect()
}

createTestLog()
