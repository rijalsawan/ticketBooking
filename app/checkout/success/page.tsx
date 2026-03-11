import Link from "next/link";
import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Payment Successful" };

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;

  let order = null;
  if (session_id) {
    try {
      order = await prisma.order.findUnique({
        where: { stripeSessionId: session_id },
        include: {
          event: { select: { title: true, date: true, venue: true } },
          tickets: { select: { ticketNumber: true } },
        },
      });
    } catch {
      // Ignore DB errors on success page
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <Badge variant="success" className="mb-3">Payment Confirmed</Badge>
        <h1 className="text-2xl font-bold text-foreground mb-2">You&apos;re going!</h1>

        {/* PDF notice */}
        <div className="rounded-md border border-accent/20 bg-accent/5 px-4 py-3 mb-3 text-left">
          <p className="text-sm text-accent font-medium">Check your email for your PDF ticket</p>
          <p className="text-xs text-muted-foreground mt-1">
            A PDF ticket is attached to your confirmation email. Download it and present it at the door.
          </p>
        </div>

        {/* ID reminder */}
        <div className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 mb-6 text-left">
          <p className="text-sm text-destructive font-medium">Valid photo ID required at the door</p>
          <p className="text-xs text-muted-foreground mt-1">
            Every attendee must present a government-issued photo ID alongside their QR ticket to enter.
          </p>
        </div>

        {order && (
          <div className="rounded-lg border border-border bg-card p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Event</span>
              <span className="font-medium text-foreground">{order.event.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tickets</span>
              <span className="font-medium text-foreground">{order.quantity}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Paid</span>
              <span className="font-medium text-foreground">{formatPrice(order.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground mb-1.5">Ticket Numbers</p>
              <div className="flex flex-wrap gap-2">
                {order.tickets.map((t) => (
                  <span key={t.ticketNumber} className="bg-accent/10 text-accent font-mono text-xs px-2 py-0.5 rounded-md">
                    {t.ticketNumber}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/tickets"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium px-5 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Look Up Tickets
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-medium px-5 py-2 rounded-md text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

