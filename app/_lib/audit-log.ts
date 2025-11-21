import { db } from './prisma'

export async function createAuditLog({
  userId,
  action,
  resource,
  resourceId,
  ipAddress,
  userAgent,
  metadata,
}: {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  userAgent?: string
  metadata?: any
}) {
  try {
    await db.$executeRaw`
      INSERT INTO "AuditLog" (id, "userId", action, resource, "resourceId", "ipAddress", "userAgent", metadata, "createdAt")
      VALUES (gen_random_uuid()::text, ${userId}, ${action}, ${resource}, ${resourceId}, ${ipAddress}, ${userAgent}, ${metadata ? JSON.stringify(metadata) : null}::jsonb, NOW())
    `
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}
