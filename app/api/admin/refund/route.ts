/**
 * POST /api/admin/refund
 * Issues a full or partial Stripe refund for an order.
 * Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  orderId: z.string().min(1),
  amount: z.number().int().positive().optional(), // partial refund in cents
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { orderId, amount } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.status === "REFUNDED") {
      return NextResponse.json({ error: "Order already refunded" }, { status: 409 });
    }

    if (!order.stripePaymentIntentId) {
      return NextResponse.json({ error: "No payment found for this order" }, { status: 400 });
    }

    // Issue Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: order.stripePaymentIntentId,
      ...(amount ? { amount } : {}), // omit for full refund
    });

    // Update records
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "REFUNDED" },
    });

    await prisma.payment.updateMany({
      where: { orderId },
      data: {
        status: "REFUNDED",
        refundId: refund.id,
        refundAmount: refund.amount,
      },
    });

    // Decrement sold tickets
    await prisma.event.update({
      where: { id: order.eventId },
      data: { soldTickets: { decrement: order.quantity } },
    });

    return NextResponse.json({ success: true, refundId: refund.id });
  } catch (err) {
    console.error("[ADMIN REFUND]", err);
    return NextResponse.json({ error: "Refund failed" }, { status: 500 });
  }
}
