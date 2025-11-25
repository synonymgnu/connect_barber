// app/api/bookings/[id]/route.ts
import { authOptions } from "@/app/_lib/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";
import { db } from "@/app/_lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const booking = await db.booking.findUnique({
      where: { id: params.id },
      include: { barber: true, user: true, service: true },
    });

    if (!booking) {
      return Response.json({ error: "Agendamento não encontrado" }, { status: 404 });
    }

    const { role, id: userId } = session.user;

    // 🔐 Regras de permissão:
    // - ADMIN: pode cancelar qualquer agendamento da barbearia
    // - BARBER: só pode cancelar os próprios
    // - USER: só pode cancelar os próprios
    let allowed = false;

    if (role === "ADMIN") {
      // Verifica se o agendamento pertence à barbearia do admin
      allowed = booking.service.barbershopId === session.user.barbershopId;
    } else if (role === "BARBER") {
      allowed = booking.barberId === userId;
    } else if (role === "USER") {
      allowed = booking.userId === userId;
    }

    if (!allowed) {
      return Response.json({ error: "Acesso negado" }, { status: 403 });
    }

    await db.booking.update({
      where: { id: params.id },
      data: { status: "CANCELLED" },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return Response.json({ error: "Erro ao cancelar" }, { status: 500 });
  }
}