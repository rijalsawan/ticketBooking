import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  orderId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Please provide a valid email." }, { status: 400 });
    }

    const { email, orderId } = parsed.data;

    const where: Record<string, unknown> = {
      status: "COMPLETED",
      guestEmail: { equals: email, mode: "insensitive" },
    };
    if (orderId?.trim()) {
      where.id = orderId.trim();
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        event: { select: { title: true, date: true, doorsOpen: true, venue: true, address: true } },
        tickets: {
          select: {
            id: true,
            ticketNumber: true,
            qrCode: true,
            isUsed: true,
            holderName: true,
            holderEmail: true,
            ticketType: true,
            groupSize: true,
            groupMembers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ orders });
  } catch (err) {
    console.error("[TICKET_LOOKUP]", err);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
