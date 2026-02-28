/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session and returns the session URL.
 * Handles both authenticated users and guests.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG, SITE_CONFIG } from "@/lib/config";
import { calculateOrderTotals } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  eventId: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
  guestName: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { eventId, quantity, guestName, guestEmail, guestPhone } = parsed.data;

    // Guest checkout requires name + email
    if (!session) {
      if (!guestName || !guestEmail) {
        return NextResponse.json(
          { error: "Name and email are required for guest checkout" },
          { status: 400 },
        );
      }
    }

    // Fetch event
    const event = await prisma.event.findUnique({ where: { id: eventId } });
    if (!event || !event.isActive) {
      return NextResponse.json({ error: "Event not found or inactive" }, { status: 404 });
    }

    // Check availability
    const available = event.totalTickets - event.soldTickets;
    if (quantity > available) {
      return NextResponse.json(
        { error: `Only ${available} ticket(s) remaining` },
        { status: 409 },
      );
    }

    const { subtotal, tax, total } = calculateOrderTotals(event.price, quantity);

    const customerEmail = session?.user?.email ?? guestEmail;
    const customerName = session?.user?.name ?? guestName;

    // Create pending order first
    const order = await prisma.order.create({
      data: {
        userId: session?.user?.id ?? null,
        guestEmail: session ? null : guestEmail,
        guestName: session ? null : guestName,
        guestPhone: session ? null : guestPhone,
        eventId: event.id,
        quantity,
        subtotal,
        tax,
        total,
        status: "PENDING",
      },
    });

    // Stripe Checkout Session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail ?? undefined,
      line_items: [
        {
          price_data: {
            currency: EVENT_CONFIG.currency,
            product_data: {
              name: event.title,
              description: `${EVENT_CONFIG.date} · ${event.venue} · ${quantity} ticket(s)`,
              images: [`${SITE_CONFIG.url}/og-image.jpg`],
            },
            unit_amount: event.price + Math.round(event.price * 0.05), // includes tax
          },
          quantity,
        },
      ],
      metadata: {
        orderId: order.id,
        eventId: event.id,
        quantity: String(quantity),
        customerName: customerName ?? "",
        customerEmail: customerEmail ?? "",
      },
      success_url: `${SITE_CONFIG.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_CONFIG.url}/checkout/cancel`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min expiry
    });

    // Save stripe session ID on the order
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (err) {
    console.error("[CHECKOUT]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
