import { PrismaClient } from "@prisma/client"
import { encrypt, decrypt } from "./encryption"

declare global {
    // eslint-disable-next-line no-unused-vars
    var cachedPrisma: PrismaClient
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
    prisma = new PrismaClient({
        log: ['error'],
    })
} else {
    if (!global.cachedPrisma) {
        global.cachedPrisma = new PrismaClient({
            log: ['error', 'warn'],
        })
    }
    prisma = global.cachedPrisma
}

const extendedPrisma = prisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        // Criptografar dados sensíveis
        if (args.data.phone) {
          args.data.phone = encrypt(args.data.phone as string)
        }
        if (args.data.email) {
          args.data.email = encrypt(args.data.email as string)
        }
        
        const result = await query(args)
        
        // Descriptografar na resposta
        if (result.phone) result.phone = decrypt(result.phone)
        if (result.email) result.email = decrypt(result.email)
        
        return result
      },
      
      async update({ args, query }) {
        if (args.data.phone) {
          args.data.phone = encrypt(args.data.phone as string)
        }
        if (args.data.email) {
          args.data.email = encrypt(args.data.email as string)
        }
        
        const result = await query(args)
        
        if (result.phone) result.phone = decrypt(result.phone)
        if (result.email) result.email = decrypt(result.email)
        
        return result
      },
      
      async upsert({ args, query }) {
        if (args.create.phone) {
          args.create.phone = encrypt(args.create.phone as string)
        }
        if (args.create.email) {
          args.create.email = encrypt(args.create.email as string)
        }
        if (args.update.phone) {
          args.update.phone = encrypt(args.update.phone as string)
        }
        if (args.update.email) {
          args.update.email = encrypt(args.update.email as string)
        }
        
        const result = await query(args)
        
        if (result.phone) result.phone = decrypt(result.phone)
        if (result.email) result.email = decrypt(result.email)
        
        return result
      },
      
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone) result.phone = decrypt(result.phone)
          if (result.email) result.email = decrypt(result.email)
        }
        return result
      },
      
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone) result.phone = decrypt(result.phone)
          if (result.email) result.email = decrypt(result.email)
        }
        return result
      },
      
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.phone) r.phone = decrypt(r.phone)
          if (r.email) r.email = decrypt(r.email)
          return r
        })
      },
    },
    
    account: {
      async create({ args, query }) {
        if (args.data.access_token) {
          args.data.access_token = encrypt(args.data.access_token as string)
        }
        if (args.data.refresh_token) {
          args.data.refresh_token = encrypt(args.data.refresh_token as string)
        }
        if (args.data.id_token) {
          args.data.id_token = encrypt(args.data.id_token as string)
        }
        return query(args)
      },
      
      async update({ args, query }) {
        if (args.data.access_token) {
          args.data.access_token = encrypt(args.data.access_token as string)
        }
        if (args.data.refresh_token) {
          args.data.refresh_token = encrypt(args.data.refresh_token as string)
        }
        if (args.data.id_token) {
          args.data.id_token = encrypt(args.data.id_token as string)
        }
        return query(args)
      },
      
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.access_token) result.access_token = decrypt(result.access_token)
          if (result.refresh_token) result.refresh_token = decrypt(result.refresh_token)
          if (result.id_token) result.id_token = decrypt(result.id_token)
        }
        return result
      },
      
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.access_token) result.access_token = decrypt(result.access_token)
          if (result.refresh_token) result.refresh_token = decrypt(result.refresh_token)
          if (result.id_token) result.id_token = decrypt(result.id_token)
        }
        return result
      },
      
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.access_token) r.access_token = decrypt(r.access_token)
          if (r.refresh_token) r.refresh_token = decrypt(r.refresh_token)
          if (r.id_token) r.id_token = decrypt(r.id_token)
          return r
        })
      },
    },
    
    booking: {
      async create({ args, query }) {
        if (args.data.notes) {
          args.data.notes = encrypt(args.data.notes as string)
        }
        
        const result = await query(args)
        
        if (result.notes) result.notes = decrypt(result.notes)
        return result
      },
      
      async update({ args, query }) {
        if (args.data.notes) {
          args.data.notes = encrypt(args.data.notes as string)
        }
        
        const result = await query(args)
        
        if (result.notes) result.notes = decrypt(result.notes)
        return result
      },
      
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.notes) result.notes = decrypt(result.notes)
          if (result.user?.email) result.user.email = decrypt(result.user.email)
          if (result.user?.phone) result.user.phone = decrypt(result.user.phone)
        }
        return result
      },
      
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.notes) result.notes = decrypt(result.notes)
          if (result.user?.email) result.user.email = decrypt(result.user.email)
          if (result.user?.phone) result.user.phone = decrypt(result.user.phone)
        }
        return result
      },
      
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.notes) r.notes = decrypt(r.notes)
          if (r.user?.email) r.user.email = decrypt(r.user.email)
          if (r.user?.phone) r.user.phone = decrypt(r.user.phone)
          return r
        })
      },
    },
    
    barber: {
      async create({ args, query }) {
        if (args.data.phone) {
          args.data.phone = encrypt(args.data.phone as string)
        }
        if (args.data.email) {
          args.data.email = encrypt(args.data.email as string)
        }
        
        const result = await query(args)
        
        if (result.phone) result.phone = decrypt(result.phone)
        if (result.email) result.email = decrypt(result.email)
        
        return result
      },
      
      async update({ args, query }) {
        if (args.data.phone) {
          args.data.phone = encrypt(args.data.phone as string)
        }
        if (args.data.email) {
          args.data.email = encrypt(args.data.email as string)
        }
        
        const result = await query(args)
        
        if (result.phone) result.phone = decrypt(result.phone)
        if (result.email) result.email = decrypt(result.email)
        
        return result
      },
      
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone) result.phone = decrypt(result.phone)
          if (result.email) result.email = decrypt(result.email)
        }
        return result
      },
      
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone) result.phone = decrypt(result.phone)
          if (result.email) result.email = decrypt(result.email)
        }
        return result
      },
      
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.phone) r.phone = decrypt(r.phone)
          if (r.email) r.email = decrypt(r.email)
          return r
        })
      },
    },
    
    barbershop: {
      async create({ args, query }) {
        // Phone é array de strings
        if (args.data.phone && Array.isArray(args.data.phone)) {
          args.data.phone = args.data.phone.map((p: string) => encrypt(p))
        }
        if (args.data.address) {
          args.data.address = encrypt(args.data.address as string)
        }
        
        const result = await query(args)
        
        if (result.phone && Array.isArray(result.phone)) {
          result.phone = result.phone.map((p: string) => decrypt(p))
        }
        if (result.address) {
          result.address = decrypt(result.address)
        }
        
        return result
      },
      
      async update({ args, query }) {
        if (args.data.phone && Array.isArray(args.data.phone)) {
          args.data.phone = args.data.phone.map((p: string) => encrypt(p))
        }
        if (args.data.address) {
          args.data.address = encrypt(args.data.address as string)
        }
        
        const result = await query(args)
        
        if (result.phone && Array.isArray(result.phone)) {
          result.phone = result.phone.map((p: string) => decrypt(p))
        }
        if (result.address) {
          result.address = decrypt(result.address)
        }
        
        return result
      },
      
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone && Array.isArray(result.phone)) {
            result.phone = result.phone.map((p: string) => decrypt(p))
          }
          if (result.address) {
            result.address = decrypt(result.address)
          }
        }
        return result
      },
      
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result) {
          if (result.phone && Array.isArray(result.phone)) {
            result.phone = result.phone.map((p: string) => decrypt(p))
          }
          if (result.address) {
            result.address = decrypt(result.address)
          }
        }
        return result
      },
      
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.phone && Array.isArray(r.phone)) {
            r.phone = r.phone.map((p: string) => decrypt(p))
          }
          if (r.address) {
            r.address = decrypt(r.address)
          }
          return r
        })
      },
    },
  },
})

export const db = extendedPrisma
