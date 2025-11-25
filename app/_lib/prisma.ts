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

// CRIPTOGRAFIA DESABILITADA

const extendedPrisma = prisma.$extends({
  query: {
    user: {
      async create({ args, query }) {
        if (args.data.phone) args.data.phone = encrypt(args.data.phone as string)
        const result = await query(args)
        if (result.phone) result.phone = decrypt(result.phone)
        return result
      },
      async update({ args, query }) {
        if (args.data.phone) args.data.phone = encrypt(args.data.phone as string)
        const result = await query(args)
        if (result.phone) result.phone = decrypt(result.phone)
        return result
      },
      async findUnique({ args, query }) {
        const result = await query(args)
        if (result?.phone) result.phone = decrypt(result.phone)
        return result
      },
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.phone) r.phone = decrypt(r.phone)
          return r
        })
      },
    },
    account: {
      async create({ args, query }) {
        if (args.data.access_token) args.data.access_token = encrypt(args.data.access_token as string)
        if (args.data.refresh_token) args.data.refresh_token = encrypt(args.data.refresh_token as string)
        if (args.data.id_token) args.data.id_token = encrypt(args.data.id_token as string)
        return query(args)
      },
      async findFirst({ args, query }) {
        const result = await query(args)
        if (result?.access_token) result.access_token = decrypt(result.access_token)
        if (result?.refresh_token) result.refresh_token = decrypt(result.refresh_token)
        if (result?.id_token) result.id_token = decrypt(result.id_token)
        return result
      },
    },
    booking: {
      async create({ args, query }) {
        if (args.data.notes) args.data.notes = encrypt(args.data.notes as string)
        const result = await query(args)
        if (result.notes) result.notes = decrypt(result.notes)
        return result
      },
      async update({ args, query }) {
        if (args.data.notes) args.data.notes = encrypt(args.data.notes as string)
        const result = await query(args)
        if (result.notes) result.notes = decrypt(result.notes)
        return result
      },
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.notes) r.notes = decrypt(r.notes)
          return r
        })
      },
    },
    barber: {
      async create({ args, query }) {
        if (args.data.phone) args.data.phone = encrypt(args.data.phone as string)
        const result = await query(args)
        if (result.phone) result.phone = decrypt(result.phone)
        return result
      },
      async update({ args, query }) {
        if (args.data.phone) args.data.phone = encrypt(args.data.phone as string)
        const result = await query(args)
        if (result.phone) result.phone = decrypt(result.phone)
        return result
      },
      async findMany({ args, query }) {
        const results = await query(args)
        return results.map(r => {
          if (r.phone) r.phone = decrypt(r.phone)
          return r
        })
      },
    },
  },
})

export const db = extendedPrisma

// export const db = prisma
