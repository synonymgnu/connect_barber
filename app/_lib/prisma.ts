import { PrismaClient } from "@prisma/client"

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

export const db = prisma
