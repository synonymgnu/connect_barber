import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const SALT_LENGTH = 64

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('ENCRYPTION_KEY não configurada em produção')
}

function deriveKey(salt: Buffer): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY não configurada')
  }
  return crypto.pbkdf2Sync(
    Buffer.from(ENCRYPTION_KEY, 'base64'),
    salt,
    100000,
    32,
    'sha512'
  )
}

export function encrypt(text: string): string {
  if (!text || !ENCRYPTION_KEY) return text

  const salt = crypto.randomBytes(SALT_LENGTH)
  const key = deriveKey(salt)
  const iv = crypto.randomBytes(IV_LENGTH)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return [
    salt.toString('hex'),
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted
  ].join(':')
}

export function decrypt(encryptedData: string): string {
  if (!encryptedData || !encryptedData.includes(':') || !ENCRYPTION_KEY) {
    return encryptedData
  }

  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 4) return encryptedData

    const [saltHex, ivHex, authTagHex, encrypted] = parts
    
    const salt = Buffer.from(saltHex, 'hex')
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')
    const key = deriveKey(salt)
    
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    return decrypted
  } catch (error) {
    console.error('Erro ao descriptografar:', error)
    return encryptedData
  }
}

export function generateKey(): string {
  return crypto.randomBytes(32).toString('base64')
}
