/**
 * POST /api/admin/verify – Verify and check-in a ticket by ticket number
 * Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { ticketNumber } = body as { ticketNumber?: string };

    if (!ticketNumber) {
      return NextResponse.json(
        { error: "Ticket number is required" },
        { status: 400 },
      );
    }

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        event: {
          select: { title: true, date: true, venue: true, address: true },
        },
        order: {
          select: {
            status: true,
            user: { select: { name: true, email: true } },
            guestName: true,
            guestEmail: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json(
        { valid: false, error: "Ticket not found" },
        { status: 404 },
      );
    }

    // Check if order was completed
    if (ticket.order.status !== "COMPLETED") {
      return NextResponse.json({
        valid: false,
        error: `Order is ${ticket.order.status.toLowerCase()} — ticket is not valid`,
        ticket: formatTicketResponse(ticket),
      });
    }

    // Check if already used
    if (ticket.isUsed) {
      return NextResponse.json({
        valid: false,
        error: `Ticket already checked in${ticket.usedAt ? ` at ${new Date(ticket.usedAt).toLocaleTimeString("en-CA", { timeZone: "America/Winnipeg", hour: "2-digit", minute: "2-digit" })}` : ""}`,
        ticket: formatTicketResponse(ticket),
      });
    }

    // Mark as used
    const updated = await prisma.ticket.update({
      where: { ticketNumber },
      data: { isUsed: true, usedAt: new Date() },
      include: {
        event: {
          select: { title: true, date: true, venue: true, address: true },
        },
        order: {
          select: {
            status: true,
            user: { select: { name: true, email: true } },
            guestName: true,
            guestEmail: true,
          },
        },
      },
    });

    return NextResponse.json({
      valid: true,
      message: "Ticket verified — welcome in!",
      ticket: formatTicketResponse(updated),
    });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function formatTicketResponse(ticket: {
  ticketNumber: string;
  holderName: string | null;
  holderEmail: string | null;
  isUsed: boolean;
  usedAt: Date | null;
  event: { title: string; date: Date; venue: string; address: string };
  order: {
    status: string;
    user: { name: string | null; email: string } | null;
    guestName: string | null;
    guestEmail: string | null;
  };
}) {
  return {
    ticketNumber: ticket.ticketNumber,
    holderName:
      ticket.holderName ||
      ticket.order.user?.name ||
      ticket.order.guestName ||
      "Unknown",
    holderEmail:
      ticket.holderEmail ||
      ticket.order.user?.email ||
      ticket.order.guestEmail ||
      null,
    isUsed: ticket.isUsed,
    usedAt: ticket.usedAt,
    event: ticket.event,
  };
}
