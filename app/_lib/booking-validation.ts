import { db } from './prisma'

// BRT = UTC-3 (offset fixo, barbearia no Brasil)
const SHOP_TZ_OFFSET_MINUTES = 180

/**
 * Converte uma data UTC para minutos do dia no fuso BRT.
 * Ex: 12:30 UTC → 09:30 BRT → 570 minutos
 */
function toLocalMinutes(date: Date): number {
  return date.getUTCHours() * 60 + date.getUTCMinutes() - SHOP_TZ_OFFSET_MINUTES
}

/**
 * Retorna o dia da semana (0-6) no fuso BRT para uma data UTC.
 * Evita erro quando UTC cai em dia diferente do local (ex: 23:30 BRT = 02:30 UTC do dia seguinte).
 */
function localDayOfWeek(date: Date): number {
  return new Date(date.getTime() - SHOP_TZ_OFFSET_MINUTES * 60 * 1000).getUTCDay()
}

interface ValidateBookingTimeParams {
  date: Date
  serviceId: string
  barberId: string | null
  excludeBookingId?: string // para edição, exclui o próprio booking do conflito
}

/**
 * Valida se o horário do booking está dentro do funcionamento da barbearia e do barbeiro,
 * e se não há conflito com outros bookings do mesmo barbeiro.
 * Lança um Error com mensagem descritiva se inválido.
 */
export async function validateBookingTime({
  date,
  serviceId,
  barberId,
  excludeBookingId,
}: ValidateBookingTimeParams): Promise<void> {
  const service = await db.barbershopService.findUnique({
    where: { id: serviceId },
    include: { barbershop: { include: { hours: true } } },
  })
  if (!service) throw new Error('Serviço não encontrado')

  const dayOfWeek = localDayOfWeek(date)
  const bookingLocalMinutes = toLocalMinutes(date)
  const bookingEndLocalMinutes = bookingLocalMinutes + service.duration

  // Valida horário de funcionamento da barbearia
  const shopHours = service.barbershop.hours.find(
    (h) => h.dayOfWeek === dayOfWeek && h.isActive
  )
  if (!shopHours) {
    throw new Error('A barbearia não funciona neste dia')
  }
  const [shH, shM] = shopHours.startTime.split(':').map(Number)
  const [ehH, ehM] = shopHours.endTime.split(':').map(Number)
  const shopStartLocal = shH * 60 + shM
  const shopEndLocal = ehH * 60 + ehM

  if (bookingLocalMinutes < shopStartLocal || bookingEndLocalMinutes > shopEndLocal) {
    throw new Error(
      `Horário fora do funcionamento da barbearia (${shopHours.startTime}–${shopHours.endTime})`
    )
  }

  // Valida horário de trabalho do barbeiro
  if (barberId) {
    const barberSchedule = await db.barberWorkSchedule.findFirst({
      where: { barberId, dayOfWeek, isActive: true },
    })
    if (!barberSchedule) {
      throw new Error('O barbeiro não trabalha neste dia')
    }
    const [bsH, bsM] = barberSchedule.startTime.split(':').map(Number)
    const [beH, beM] = barberSchedule.endTime.split(':').map(Number)
    const barberStartLocal = bsH * 60 + bsM
    const barberEndLocal = beH * 60 + beM

    if (bookingLocalMinutes < barberStartLocal || bookingEndLocalMinutes > barberEndLocal) {
      throw new Error(
        `Horário fora do expediente do barbeiro (${barberSchedule.startTime}–${barberSchedule.endTime})`
      )
    }

    // Verifica ausência do barbeiro no dia
    const dayStartUTC = new Date(date.getTime() - bookingLocalMinutes * 60 * 1000)
    const dayEndUTC = new Date(dayStartUTC.getTime() + 24 * 60 * 60 * 1000 - 1)
    const absence = await db.barberAbsence.findFirst({
      where: { barberId, date: { gte: dayStartUTC, lte: dayEndUTC } },
    })
    if (absence) {
      throw new Error('O barbeiro está ausente neste dia')
    }

    // Verifica conflito com outros bookings do barbeiro
    const bookingEnd = new Date(date.getTime() + service.duration * 60 * 1000)
    const conflict = await db.booking.findFirst({
      where: {
        barberId,
        status: { notIn: ['CANCELLED'] },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        AND: [
          { date: { lt: bookingEnd } },
          { date: { gte: new Date(date.getTime() - (service.duration - 1) * 60 * 1000) } },
        ],
      },
      include: { service: { select: { duration: true } } },
    })

    if (conflict) {
      const conflictEnd = new Date(
        conflict.date.getTime() + (conflict.service?.duration ?? service.duration) * 60 * 1000
      )
      if (date < conflictEnd && bookingEnd > conflict.date) {
        throw new Error('Este horário já está ocupado para o barbeiro selecionado')
      }
    }
  }
}
