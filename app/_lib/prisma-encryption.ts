import { encrypt, decrypt } from './encryption'

const ENCRYPTED_FIELDS = {
  User: ['phone'],
  Account: ['access_token', 'refresh_token', 'id_token'],
  Booking: ['notes'],
  Barber: ['phone'],
} as const

type MiddlewareParams = {
  model?: string
  action: string
  args: any
  dataPath: string[]
  runInTransaction: boolean
}

export const encryptionMiddleware = async (params: MiddlewareParams, next: (params: MiddlewareParams) => Promise<any>) => {
  const model = params.model as keyof typeof ENCRYPTED_FIELDS
  const fieldsToEncrypt = ENCRYPTED_FIELDS[model]

  if (!fieldsToEncrypt) {
    return next(params)
  }

  if (params.action === 'create' || params.action === 'update' || params.action === 'upsert') {
    const data = params.action === 'upsert' ? params.args.create : params.args.data
    
    if (data) {
      for (const field of fieldsToEncrypt) {
        if (data[field] && typeof data[field] === 'string') {
          data[field] = encrypt(data[field])
        }
      }
    }
  }

  const result = await next(params)

  if (result && fieldsToEncrypt) {
    if (Array.isArray(result)) {
      result.forEach(item => decryptFields(item, fieldsToEncrypt))
    } else if (result) {
      decryptFields(result, fieldsToEncrypt)
    }
  }

  return result
}

function decryptFields(obj: any, fields: readonly string[]) {
  if (!obj) return
  
  for (const field of fields) {
    if (obj[field] && typeof obj[field] === 'string') {
      obj[field] = decrypt(obj[field])
    }
  }
}
