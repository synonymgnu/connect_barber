// app/api/customers/route.ts
import { NextRequest } from "next/server";
import prisma from "@/app/_lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, phone } = await req.json();

    // Cria cliente SEM autenticação
    const customer = await prisma.user.create({
        data: {
        name,
        email: "", // ou gere um email temporário
        role: "USER",
        // não use barberId, barbershopId, etc.
      },
    });

    return Response.json(customer, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return Response.json({ error: "Erro ao criar cliente" }, { status: 500 });
  }
}