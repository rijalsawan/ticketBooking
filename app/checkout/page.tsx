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
    <div className="min-h-[80vh] bg-[#080808] py-28 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Get Your Tickets
          </h1>
          <p className="text-white/40 mt-2 text-sm">
            Secure checkout powered by Stripe
          </p>
        </div>

        {soldOut ? (
          <div className="text-center bg-white/[0.03] rounded-2xl p-12 shadow border border-white/6">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Sold Out</h2>
            <p className="text-white/40">
              All {event?.totalTickets} tickets have been claimed. Stay tuned for future events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Checkout form – 3 cols */}
            <div className="lg:col-span-3">
              <CheckoutForm
                eventId={event?.id ?? ""}
                pricePerTicket={event?.price ?? EVENT_CONFIG.ticketPrice * 100}
                maxQuantity={Math.min(remaining, EVENT_CONFIG.maxTicketsPerOrder)}
              />
            </div>
            {/* Order summary – 2 cols */}
            <div className="lg:col-span-2">
              <OrderSummary
                pricePerTicket={event?.price ?? EVENT_CONFIG.ticketPrice * 100}
                remaining={remaining}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
