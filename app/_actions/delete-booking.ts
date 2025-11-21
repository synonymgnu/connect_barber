"use server"

import { revalidatePath } from "next/cache"
import { db } from "../_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../_lib/auth"
import { notifyBookingCancelled } from "../_lib/notifications/create-notification"
import { createAuditLog } from "../_lib/audit"

export const deleteBooking = async (bookingId: string) => {
    const session = await getServerSession(authOptions)
    
    const booking = await db.booking.findUnique({
        where: { id: bookingId },
        include: {
            user: true,
            service: { include: { barbershop: true } },
            barber: true,
        },
    })

    if (booking) {
        let cancelledBy: "CLIENT" | "BARBER" | "ADMIN" = "CLIENT"
        
        if (session?.user.role === "ADMIN") {
            cancelledBy = "ADMIN"
        } else if (session?.user.role === "BARBER") {
            cancelledBy = "BARBER"
        }

        await notifyBookingCancelled(booking, cancelledBy)
    }

    await db.booking.delete({
        where: { id: bookingId },
    })
    
    if (session?.user) {
        await createAuditLog({
            userId: session.user.id,
            action: 'CANCEL_BOOKING',
            resource: 'booking',
            resourceId: bookingId,
            ipAddress: 'server-action',
            userAgent: 'client-app',
            metadata: { cancelledBy: session.user.role }
        })
    }
    
    revalidatePath("/bookings")
}