import { Metadata } from "next";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";

export const metadata: Metadata = {
  title: "Buy Tickets",
};

async function getEvent() {
  try {
    return await prisma.event.findUnique({
      where: { slug: EVENT_CONFIG.slug },
    });
  } catch {
    return null;
  }
}

export default async function CheckoutPage() {
  const event = await getEvent();

  const soldOut = event ? event.soldTickets >= event.totalTickets : false;
  const remaining = event ? event.totalTickets - event.soldTickets : EVENT_CONFIG.totalCapacity;

  return (
    <div className="min-h-[80vh] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Get Your Tickets</h1>
          <p className="text-muted-foreground mt-1 text-sm">Secure checkout powered by Stripe</p>
        </div>

        {!event ? (
          <div className="text-center rounded-lg border border-destructive/30 bg-destructive/5 p-12">
            <p className="text-destructive font-medium mb-1">Event not available</p>
            <p className="text-muted-foreground text-sm">The event could not be loaded. Please try again later.</p>
          </div>
        ) : soldOut ? (
          <div className="text-center rounded-lg border border-border bg-card p-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Sold Out</h2>
            <p className="text-muted-foreground">
              All {event.totalTickets} tickets have been claimed. Stay tuned for future events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <CheckoutForm
                eventId={event.id}
                pricePerTicket={event.price}
                maxQuantity={Math.min(remaining, EVENT_CONFIG.maxTicketsPerOrder)}
              />
            </div>
            <div className="lg:col-span-2">
              <OrderSummary pricePerTicket={event.price} remaining={remaining} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

