import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

const aesKey = crypto.randomBytes(32).toString('base64')

const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
})

console.log('Gerando chaves de criptografia...\n')
console.log('=== ADICIONE AO SEU .env ===\n')
console.log(`ENCRYPTION_KEY="${aesKey}"`)
console.log(`\nRSA_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"`)
console.log(`\nRSA_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"`)

const envPath = path.join(process.cwd(), '.env.encryption')
fs.writeFileSync(envPath, 
  `# Chaves de Criptografia - NUNCA COMMITAR\n` +
  `ENCRYPTION_KEY="${aesKey}"\n\n` +
  `RSA_PUBLIC_KEY="${publicKey.replace(/\n/g, '\\n')}"\n\n` +
  `RSA_PRIVATE_KEY="${privateKey.replace(/\n/g, '\\n')}"\n`
)

console.log('\nChaves salvas em .env.encryption')
console.log('IMPORTANTE: Adicione .env.encryption ao .gitignore')
console.log('Faça backup seguro da ENCRYPTION_KEY')
console.log('Sem a chave, os dados criptografados são irrecuperáveis!')
