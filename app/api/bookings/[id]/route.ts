// app/api/bookings/[id]/route.ts
import { auth } from "@/app/_lib/auth";
import { NextRequest } from "next/server";
import PrismaClient from "@/app/_lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const booking = await PrismaClient.booking.findUnique({
      where: { id: params.id },
      include: { barber: true, user: true },
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

    await PrismaClient.booking.update({
      where: { id: params.id },
       { status: "CANCELLED" },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erro ao cancelar agendamento:", error);
    return Response.json({ error: "Erro ao cancelar" }, { status: 500 });
  }
}