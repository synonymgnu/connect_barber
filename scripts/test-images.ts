import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testImages() {
  console.log('Testing user images...')

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      image: true,
      createdAt: true,
    },
  })

  console.log('All users and their images:')
  users.forEach((user) => {
    console.log(
      `- ${user.name || user.email}: role=${user.role}, image=${user.image || 'NULL'}, created=${user.createdAt}`
    )
  })

  // Separar por role
  console.log('\n=== CLIENT users ===')
  const clients = users.filter((u) => u.role === 'CLIENT')
  clients.forEach((user) => {
    console.log(`- ${user.name}: image=${user.image || 'NULL'}`)
  })

  console.log('\n=== ADMIN users ===')
  const admins = users.filter((u) => u.role === 'ADMIN')
  admins.forEach((user) => {
    console.log(`- ${user.name}: image=${user.image || 'NULL'}`)
  })

  console.log('\n=== BARBER users ===')
  const barbers = users.filter((u) => u.role === 'BARBER')
  barbers.forEach((user) => {
    console.log(`- ${user.name}: image=${user.image || 'NULL'}`)
  })

  // Tentar corrigir images dos BARBER definindo uma imagem padrão do Google
  const barbersWithoutImage = barbers.filter((u) => !u.image)
  if (barbersWithoutImage.length > 0) {
    console.log(
      `\nCorrigindo ${barbersWithoutImage.length} usuários BARBER sem imagem...`
    )
    for (const barber of barbersWithoutImage) {
      await prisma.user.update({
        where: { id: barber.id },
        data: {
          image: 'https://lh3.googleusercontent.com/a/default-google-avatar',
        },
      })
      console.log(`- Corrigido: ${barber.name}`)
    }
    console.log('Usuários BARBER com imagens corrigidas!')
  } else {
    console.log('\nTodos os usuários BARBER já têm imagens.')
  }

  await prisma.$disconnect()
}

testImages().catch(console.error)
