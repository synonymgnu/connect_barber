import { db } from './prisma'

interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
}

// Ações por papel
export const AuditActions = {
  // ADMIN
  CREATE_BARBERSHOP: 'CREATE_BARBERSHOP',
  UPDATE_BARBERSHOP: 'UPDATE_BARBERSHOP',
  CREATE_SERVICE: 'CREATE_SERVICE',
  UPDATE_SERVICE: 'UPDATE_SERVICE',
  DELETE_SERVICE: 'DELETE_SERVICE',
  CREATE_BARBER: 'CREATE_BARBER',
  UPDATE_BARBER: 'UPDATE_BARBER',
  DELETE_BARBER: 'DELETE_BARBER',
  UPDATE_BOOKING: 'UPDATE_BOOKING',
  DELETE_BOOKING: 'DELETE_BOOKING',
  EXPORT_DATA: 'EXPORT_DATA',
  
  // BARBER
  UPDATE_BOOKING_STATUS: 'UPDATE_BOOKING_STATUS',
  CREATE_ABSENCE: 'CREATE_ABSENCE',
  UPDATE_SCHEDULE: 'UPDATE_SCHEDULE',
  
  // CLIENT
  CREATE_BOOKING: 'CREATE_BOOKING',
  CANCEL_BOOKING: 'CANCEL_BOOKING',
  UPDATE_PROFILE: 'UPDATE_PROFILE',
  
  // SYSTEM
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  FAILED_LOGIN: 'FAILED_LOGIN',
} as const

export async function createAuditLog(data: AuditLogData) {
  try {
    await db.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata
      }
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}

export function getClientInfo(request: Request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  }
}
