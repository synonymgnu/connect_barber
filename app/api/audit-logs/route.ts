import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/_lib/auth'
import { db } from '@/app/_lib/prisma'
import { createAuditLog, getClientInfo } from '@/app/_lib/audit'
import { decrypt } from '@/app/_lib/encryption'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!session.user.barbershopId) {
    return NextResponse.json({ error: 'Barbearia não encontrada' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const action = searchParams.get('action')
  const isExport = searchParams.get('export') === 'true'

  // Buscar apenas logs de ações na barbearia específica
  // 1. Ações do admin/barbeiros da barbearia
  // 2. Ações de clientes em bookings DESTA barbearia
  
  const barbershopStaff = await db.user.findMany({
    where: {
      OR: [
        { ownedBarbershop: { id: session.user.barbershopId } },
        { barber: { barbershopId: session.user.barbershopId } }
      ]
    },
    select: { id: true }
  })

  const staffIds = barbershopStaff.map(u => u.id)

  // Filtrar logs por metadata.barbershopId ou por userId de staff
  const allLogs = await db.auditLog.findMany({
    orderBy: { createdAt: 'desc' }
  })

  // Filtrar logs que pertencem a esta barbearia
  const validLogIds = allLogs
    .filter(log => {
      // Logs de staff sempre são válidos
      if (staffIds.includes(log.userId || '')) return true
      
      // Logs com barbershopId no metadata
      if (log.metadata && typeof log.metadata === 'object') {
        const metadata = log.metadata as any
        if (metadata.barbershopId === session.user.barbershopId) return true
      }
      
      return false
    })
    .map(log => log.id)

  const where: any = {
    id: { in: validLogIds }
  }
  
  if (action) where.action = action

  const rawLogs = await db.auditLog.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  })

  const logs = rawLogs.map(log => ({
    ...log,
    user: log.user ? { ...log.user, email: decrypt(log.user.email ?? '') || log.user.email } : null
  }))

  const total = await db.auditLog.count({ where })

  if (isExport) {
    const clientInfo = getClientInfo(req)
    await createAuditLog({
      userId: session.user.id,
      action: 'EXPORT_DATA',
      resource: 'audit-logs',
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { actionFilter: action || 'all', totalRecords: total, barbershopId: session.user.barbershopId }
    })
  }

  return NextResponse.json({
    logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  })
}
