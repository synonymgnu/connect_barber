import { db } from "../prisma"

type NotificationType = "BOOKING_CREATED" | "BOOKING_CANCELLED" | "BOOKING_CONFIRMED"

export async function createNotification({
  userId,
  type,
  title,
  message,
  bookingId,
}: {
  userId: string
  type: NotificationType
  title: string
  message: string
  bookingId?: string
}) {
  try {
    await db.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        bookingId,
      },
    })
  } catch (error) {
    console.error("Erro ao criar notificação:", error)
  }
}

export async function notifyBookingCreated(booking: any) {
  const barbershop = await db.barbershop.findUnique({
    where: { id: booking.service.barbershopId },
    include: { owner: true }
  })

  if (barbershop?.owner) {
    await createNotification({
      userId: barbershop.owner.id,
      type: "BOOKING_CREATED",
      title: "Novo agendamento",
      message: `${booking.user.name} agendou ${booking.service.name}`,
      bookingId: booking.id,
    })
  }

  if (booking.barber) {
    await createNotification({
      userId: booking.barber.userId,
      type: "BOOKING_CREATED",
      title: "Novo agendamento",
      message: `${booking.user.name} agendou ${booking.service.name} com você`,
      bookingId: booking.id,
    })
  }
}

export async function notifyBookingCancelled(booking: any, cancelledBy: "CLIENT" | "BARBER" | "ADMIN") {
  if (cancelledBy === "CLIENT") {
    const barbershop = await db.barbershop.findUnique({
      where: { id: booking.service.barbershopId },
      include: { owner: true }
    })

    if (barbershop?.owner) {
      await createNotification({
        userId: barbershop.owner.id,
        type: "BOOKING_CANCELLED",
        title: "Agendamento cancelado",
        message: `${booking.user.name} cancelou o agendamento de ${booking.service.name}`,
        bookingId: booking.id,
      })
    }

    if (booking.barber) {
      await createNotification({
        userId: booking.barber.userId,
        type: "BOOKING_CANCELLED",
        title: "Agendamento cancelado",
        message: `${booking.user.name} cancelou o agendamento de ${booking.service.name}`,
        bookingId: booking.id,
      })
    }
  } else if (cancelledBy === "BARBER") {
    await createNotification({
      userId: booking.userId,
      type: "BOOKING_CANCELLED",
      title: "Agendamento cancelado",
      message: `Seu agendamento de ${booking.service.name} foi cancelado pelo barbeiro`,
      bookingId: booking.id,
    })

    const barbershop = await db.barbershop.findUnique({
      where: { id: booking.service.barbershopId },
      include: { owner: true }
    })

    if (barbershop?.owner && booking.barber?.userId !== barbershop.owner.id) {
      await createNotification({
        userId: barbershop.owner.id,
        type: "BOOKING_CANCELLED",
        title: "Agendamento cancelado",
        message: `O barbeiro cancelou o agendamento de ${booking.user.name}`,
        bookingId: booking.id,
      })
    }
  } else if (cancelledBy === "ADMIN") {
    await createNotification({
      userId: booking.userId,
      type: "BOOKING_CANCELLED",
      title: "Agendamento cancelado",
      message: `Seu agendamento de ${booking.service.name} foi cancelado`,
      bookingId: booking.id,
    })

    if (booking.barber) {
      await createNotification({
        userId: booking.barber.userId,
        type: "BOOKING_CANCELLED",
        title: "Agendamento cancelado",
        message: `O agendamento de ${booking.user.name} foi cancelado pelo administrador`,
        bookingId: booking.id,
      })
    }
  }
}
