import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"
import { createAuditLog, getClientInfo } from "@/app/_lib/audit"

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "BARBER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!session.user.barberId) {
    return NextResponse.json({ error: "Barber not found" }, { status: 404 })
  }

  const { id } = params

  try {
    const { status } = await req.json()

    if (!status || !["COMPLETED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be COMPLETED or CANCELLED" },
        { status: 400 }
      )
    }

    // Verificar se o booking pertence ao barbeiro logado
    const booking = await db.booking.findFirst({
      where: {
        id,
        barberId: session.user.barberId
      },
      select: { id: true, status: true, userId: true }
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or unauthorized" }, { status: 404 })
    }

    // Se já foi concluído ou cancelado, não permite alterar novamente
    if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
      return NextResponse.json(
        { error: "Cannot modify completed or cancelled booking" },
        { status: 400 }
      )
    }

    // Atualizar o status do booking
    const updated = await db.booking.update({
      where: { id },
      data: { status }
    })

    // Registrar auditoria
    const clientInfo = getClientInfo(req)
    await createAuditLog({
      userId: session.user.id,
      action: 'UPDATE_BOOKING_STATUS',
      resource: 'booking',
      resourceId: id,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      metadata: { oldStatus: booking.status, newStatus: status }
    })

    return NextResponse.json({
      success: true,
      booking: updated
    })

  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    )
  }
}
