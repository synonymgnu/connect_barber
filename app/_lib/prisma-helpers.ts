import { Decimal } from '@prisma/client/runtime/library'

export function serializeDecimal<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj
  
  if (obj instanceof Decimal) {
    return Number(obj) as any
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeDecimal) as any
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {}
    for (const key in obj) {
      serialized[key] = serializeDecimal(obj[key])
    }
    return serialized
  }
  
  return obj
}
