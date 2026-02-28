/**
 * GET /api/tickets
 * Returns all tickets for the currently logged-in user.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      include: {
        event: {
          select: { title: true, date: true, venue: true, address: true },
        },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            qrCode: true,
            isUsed: true,
            holderName: true,
          },
        },
        payment: {
          select: { status: true, amount: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[TICKETS]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
