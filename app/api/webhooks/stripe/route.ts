/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events:
 *  - checkout.session.completed → mark order completed, create tickets
 *  - charge.refunded            → mark order refunded
 */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import prisma from "@/lib/prisma";
import { generateTicketNumber } from "@/lib/utils";
import { sendTicketConfirmationEmail, sendAdminNewOrderEmail } from "@/lib/email";
import { SITE_CONFIG } from "@/lib/config";

export const runtime = "nodejs"; // required for raw body parsing

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[WEBHOOK] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // ── Handler map ────────────────────────────────────────────────────────────
  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "charge.refunded":
        await handleChargeRefunded(event.data.object as Stripe.Charge);
        break;
      default:
        // Ignore other events
        break;
    }
  } catch (err) {
    console.error("[WEBHOOK] Handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// ── Helpers ────────────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.orderId;
  const quantity = Number(session.metadata?.quantity ?? 1);
  const customerName = session.metadata?.customerName ?? "Guest";
  const customerEmail = session.customer_email ?? session.metadata?.customerEmail ?? "";

  if (!orderId) {
    console.error("[CHECKOUT_COMPLETED] No orderId in metadata");
    return;
  }

  // Idempotency check
  const existing = await prisma.order.findUnique({ where: { id: orderId } });
  if (!existing || existing.status === "COMPLETED") return;

  // Update order to COMPLETED
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: "COMPLETED",
      stripePaymentIntentId: session.payment_intent as string,
    },
  });

  // Create/upsert payment record
  await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      stripePaymentId: session.payment_intent as string,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "cad",
      status: "PAID",
    },
    update: {
      stripePaymentId: session.payment_intent as string,
      amount: session.amount_total ?? 0,
      status: "PAID",
    },
  });

  // Increment soldTickets on event
  await prisma.event.update({
    where: { id: existing.eventId },
    data: { soldTickets: { increment: quantity } },
  });

  // Get current ticket count for this event to generate sequential numbers
  const ticketsBefore = await prisma.ticket.count({
    where: { eventId: existing.eventId },
  });

  const ticketType = session.metadata?.ticketType ?? "INDIVIDUAL";
  const groupMembersRaw = session.metadata?.groupMembers ?? "";

  if (ticketType === "GROUP") {
    // One ticket / QR for the entire group
    let parsedMembers: string[] = [];
    try {
      parsedMembers = groupMembersRaw ? JSON.parse(groupMembersRaw) : [];
    } catch {
      parsedMembers = [];
    }

    const ticketNumber = generateTicketNumber(ticketsBefore + 1);
    await prisma.ticket.create({
      data: {
        orderId,
        eventId: existing.eventId,
        ticketNumber,
        qrCode: JSON.stringify({
          orderId,
          ticketIndex: 1,
          eventId: existing.eventId,
          holderEmail: customerEmail,
          ticketType: "GROUP",
        }),
        holderName: customerName,
        holderEmail: customerEmail,
        ticketType: "GROUP",
        groupSize: quantity,
        groupMembers: parsedMembers.length ? parsedMembers : undefined,
      },
    });
  } else {
    // One ticket per person (individual)
    const ticketsData = Array.from({ length: quantity }, (_, i) => ({
      orderId,
      eventId: existing.eventId,
      ticketNumber: generateTicketNumber(ticketsBefore + i + 1),
      qrCode: JSON.stringify({
        orderId,
        ticketIndex: i + 1,
        eventId: existing.eventId,
        holderEmail: customerEmail,
      }),
      holderName: customerName,
      holderEmail: customerEmail,
      ticketType: "INDIVIDUAL" as const,
      groupSize: 1,
    }));

    await prisma.ticket.createMany({ data: ticketsData });
  }

  // Increment discount code usage if one was applied
  const discountCodeStr = session.metadata?.discountCode ?? "";
  if (discountCodeStr) {
    try {
      await prisma.discountCode.update({
        where: { code: discountCodeStr },
        data: { usedCount: { increment: 1 } },
      });
    } catch {
      // non-fatal
    }
  }

  // Fetch created tickets for email
  const tickets = await prisma.ticket.findMany({
    where: { orderId },
    select: { ticketNumber: true, holderName: true },
  });

  // Send confirmation email
  try {
    await sendTicketConfirmationEmail({
      to: customerEmail,
      name: customerName,
      tickets,
      orderId,
      quantity,
      total: session.amount_total ?? 0,
      appUrl: SITE_CONFIG.url,
    });
  } catch (emailErr) {
    console.error("[EMAIL] Failed to send confirmation:", emailErr);
    // Don't fail the webhook for email errors
  }

  // Notify admin
  try {
    await sendAdminNewOrderEmail({
      orderId,
      buyerName: customerName,
      buyerEmail: customerEmail,
      quantity,
      total: session.amount_total ?? 0,
    });
  } catch {
    // ignore admin email errors
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  const order = await prisma.order.findFirst({
    where: { stripePaymentIntentId: charge.payment_intent as string },
  });

  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "REFUNDED" },
  });

  await prisma.payment.updateMany({
    where: { orderId: order.id },
    data: {
      status: "REFUNDED",
      refundAmount: charge.amount_refunded,
    },
  });

  // Decrement soldTickets
  await prisma.event.update({
    where: { id: order.eventId },
    data: { soldTickets: { decrement: order.quantity } },
  });
}
