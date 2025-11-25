import { PrismaClient } from '@prisma/client'
import { encrypt } from '../app/_lib/encryption'

const prisma = new PrismaClient()

async function encryptExistingData() {
  console.log('Iniciando criptografia de dados existentes...\n')

  try {
    console.log('Processando usuários...')
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
      },
    })

    let usersUpdated = 0
    for (const user of users) {
      const updates: any = {}
      
      // Verificar email já está criptografado
      if (user.email && !user.email.includes(':')) {
        updates.email = encrypt(user.email)
        console.log(`  ✓ Email: ${user.email} -> [ENCRYPTED]`)
      }
      
      // Verificar phone já está criptografado
      if (user.phone && !user.phone.includes(':')) {
        updates.phone = encrypt(user.phone)
        console.log(`  ✓ Phone: ${user.phone} -> [ENCRYPTED]`)
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: updates,
        })
        usersUpdated++
      }
    }
    console.log(`${usersUpdated} usuários criptografados\n`)


    console.log('Processando barbeiros...')
    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        email: true,
        phone: true,
      },
    })

    let barbersUpdated = 0
    for (const barber of barbers) {
      const updates: any = {}
      
      if (barber.email && !barber.email.includes(':')) {
        updates.email = encrypt(barber.email)
        console.log(`  ✓ Email: ${barber.email} -> [ENCRYPTED]`)
      }
      
      if (barber.phone && !barber.phone.includes(':')) {
        updates.phone = encrypt(barber.phone)
        console.log(`  ✓ Phone: ${barber.phone} -> [ENCRYPTED]`)
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.barber.update({
          where: { id: barber.id },
          data: updates,
        })
        barbersUpdated++
      }
    }
    console.log(`${barbersUpdated} barbeiros criptografados\n`)

    console.log('Processando barbearias...')
    const barbershops = await prisma.barbershop.findMany({
      select: {
        id: true,
        phone: true,
        address: true,
      },
    })

    let barbershopsUpdated = 0
    for (const shop of barbershops) {
      const updates: any = {}
      
      // Phone é array
      if (shop.phone && Array.isArray(shop.phone)) {
        const needsEncryption = shop.phone.some((p: string) => !p.includes(':'))
        if (needsEncryption) {
          updates.phone = shop.phone.map((p: string) => 
            p.includes(':') ? p : encrypt(p)
          )
          console.log(`  ✓ Phones: ${shop.phone.length} números -> [ENCRYPTED]`)
        }
      }
      
      if (shop.address && !shop.address.includes(':')) {
        updates.address = encrypt(shop.address)
        console.log(`  ✓ Address: ${shop.address.substring(0, 30)}... -> [ENCRYPTED]`)
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.barbershop.update({
          where: { id: shop.id },
          data: updates,
        })
        barbershopsUpdated++
      }
    }
    console.log(`${barbershopsUpdated} barbearias criptografadas\n`)


    console.log('Processando agendamentos...')
    const bookings = await prisma.booking.findMany({
      where: {
        notes: {
          not: null,
        },
      },
      select: {
        id: true,
        notes: true,
      },
    })

    let bookingsUpdated = 0
    for (const booking of bookings) {
      if (booking.notes && !booking.notes.includes(':')) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            notes: encrypt(booking.notes),
          },
        })
        console.log(`  ✓ Nota criptografada`)
        bookingsUpdated++
      }
    }
    console.log(`${bookingsUpdated} agendamentos criptografados\n`)

    console.log('Processando contas OAuth...')
    const accounts = await prisma.account.findMany({
      select: {
        provider: true,
        providerAccountId: true,
        access_token: true,
        refresh_token: true,
        id_token: true,
      },
    })

    let accountsUpdated = 0
    for (const account of accounts) {
      const updates: any = {}
      
      if (account.access_token && !account.access_token.includes(':')) {
        updates.access_token = encrypt(account.access_token)
      }
      
      if (account.refresh_token && !account.refresh_token.includes(':')) {
        updates.refresh_token = encrypt(account.refresh_token)
      }
      
      if (account.id_token && !account.id_token.includes(':')) {
        updates.id_token = encrypt(account.id_token)
      }
      
      if (Object.keys(updates).length > 0) {
        await prisma.account.update({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          data: updates,
        })
        console.log(`  ✓ Tokens OAuth criptografados`)
        accountsUpdated++
      }
    }
    console.log(`${accountsUpdated} contas OAuth criptografadas\n`)

    console.log('RESUMO DA CRIPTOGRAFIA')
    console.log(`Usuários:      ${usersUpdated}`)
    console.log(`Barbeiros:     ${barbersUpdated}`)
    console.log(`Barbearias:    ${barbershopsUpdated}`)
    console.log(`Agendamentos:  ${bookingsUpdated}`)
    console.log(`Contas OAuth:  ${accountsUpdated}`)
    console.log('criptografia concluída com sucesso!\n')

  } catch (error) {
    console.error('Erro durante a criptografia:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (!process.env.ENCRYPTION_KEY) {
  console.error('ERRO: ENCRYPTION_KEY não configurada!')
  console.error('Execute: npm run generate:keys')
  process.exit(1)
}

console.log('TENÇÃO: Este script irá criptografar dados no banco de dados.')
console.log('Certifique-se de ter um BACKUP antes de continuar!\n')
console.log('ENCRYPTION_KEY detectada:', process.env.ENCRYPTION_KEY.substring(0, 20) + '...\n')


setTimeout(() => {
  encryptExistingData()
}, 3000)

console.log('Iniciando em 3 segundos...\n')
