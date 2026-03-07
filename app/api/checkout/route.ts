/**
 * POST /api/checkout
 * Creates a Stripe Checkout Session – supports individual and group tickets,
 * and optional discount codes.
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
  ticketType: z.enum(["INDIVIDUAL", "GROUP"]).default("INDIVIDUAL"),
  groupMembers: z.array(z.object({ name: z.string().min(1) })).optional(),
  discountCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in to purchase tickets" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const msg = firstIssue
        ? `${firstIssue.path.join(".") || "input"}: ${firstIssue.message}`
        : "Invalid input";
      console.error("[CHECKOUT] Validation failed:", parsed.error.issues);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const { eventId, quantity, ticketType, groupMembers, discountCode } = parsed.data;

    // Validate group ticket – must have names for all members
    if (ticketType === "GROUP") {
      if (!groupMembers || groupMembers.length !== quantity) {
        return NextResponse.json(
          { error: "Please fill in the name of every group member" },
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

    // Resolve discount code
    let discountPercent = 0;
    let discountCodeRecord: { id: string; value: number; code: string } | null = null;

    if (discountCode?.trim()) {
      const dc = await prisma.discountCode.findUnique({
        where: { code: discountCode.trim().toUpperCase() },
      });

      const valid =
        dc &&
        dc.isActive &&
        (!dc.expiresAt || dc.expiresAt > new Date()) &&
        (dc.maxUses === null || dc.usedCount < dc.maxUses) &&
        quantity >= dc.minGroupSize;

      if (!valid) {
        return NextResponse.json(
          { error: "Discount code is invalid or cannot be applied to this order" },
          { status: 400 },
        );
      }

      discountPercent = dc.value;
      discountCodeRecord = { id: dc.id, value: dc.value, code: dc.code };
    }

    const { subtotal, discountAmount, tax, total } = calculateOrderTotals(
      event.price,
      quantity,
      discountPercent,
    );

    const customerEmail = session.user.email;
    const customerName = session.user.name ?? "Guest";

    // Create pending order
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        eventId: event.id,
        quantity,
        subtotal,
        tax,
        total,
        discountAmount,
        discountCodeId: discountCodeRecord?.id ?? null,
        status: "PENDING",
      },
    });

    // Stringify group member names for Stripe metadata (500 char limit per value)
    const membersJson =
      ticketType === "GROUP" && groupMembers
        ? JSON.stringify(groupMembers.map((m) => m.name))
        : "";

    const discountLabel =
      discountPercent > 0 ? ` · ${discountCodeRecord!.code} (${discountPercent}% off)` : "";

    // Stripe Checkout Session – pass the full order total as a single line item
    const stripeSession = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customerEmail ?? undefined,
      line_items: [
        {
          price_data: {
            currency: EVENT_CONFIG.currency,
            product_data: {
              name: `${event.title}${discountLabel}`,
              description: `${quantity} ${ticketType === "GROUP" ? "group " : ""}ticket(s)`,
            },
            unit_amount: total, // total already includes tax, applied for whole order
          },
          quantity: 1,
        },
      ],
      metadata: {
        orderId: order.id,
        eventId: event.id,
        quantity: String(quantity),
        ticketType,
        customerName: customerName ?? "",
        customerEmail: customerEmail ?? "",
        discountCode: discountCodeRecord?.code ?? "",
        discountPercent: String(discountPercent),
        groupMembers: membersJson,
      },
      success_url: `${SITE_CONFIG.url}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_CONFIG.url}/checkout/cancel`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });

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
