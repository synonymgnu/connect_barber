import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/_lib/auth"
import { db } from "@/app/_lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const notifications = await db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const unreadCount = await db.notification.count({
      where: { 
        userId: session.user.id,
        isRead: false 
      }
    })

    return NextResponse.json({ notifications, unreadCount })
  } catch (error) {
    console.error("Erro ao buscar notificações:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  try {
    const { notificationId, markAllAsRead } = await req.json()

    if (markAllAsRead) {
      await db.notification.updateMany({
        where: { 
          userId: session.user.id,
          isRead: false 
        },
        data: { isRead: true }
      })
    } else if (notificationId) {
      await db.notification.update({
        where: { 
          id: notificationId,
          userId: session.user.id 
        },
        data: { isRead: true }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao atualizar notificação:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
