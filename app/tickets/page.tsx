"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import TicketCard from "@/components/tickets/TicketCard";

interface TicketData {
  id: string;
  ticketNumber: string;
  qrCode: string;
  isUsed: boolean;
  holderName?: string | null;
  holderEmail?: string | null;
  ticketType?: string | null;
  groupSize?: number | null;
  groupMembers?: unknown;
}

interface OrderData {
  event: { title: string; date: string; doorsOpen?: string | null; venue: string; address: string };
  tickets: TicketData[];
  total: number;
  quantity: number;
}

export default function TicketsPage() {
  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderData[] | null>(null);
  const [error, setError] = useState("");

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    setLoading(true);
    setError("");
    setOrders(null);

    try {
      const res = await fetch("/api/tickets/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), orderId: orderId.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Lookup failed"); return; }
      setOrders(json.orders);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] py-24 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter your email to find your tickets.
          </p>
        </div>

        {/* Lookup form */}
        <form onSubmit={handleLookup} className="rounded-lg border border-border bg-card p-5 mb-8 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
            />
            <Input
              label="Order ID"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="(optional)"
              hint="Narrow search to a specific order"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" loading={loading} variant="default">
            Find Tickets
          </Button>
        </form>

        {/* Results */}
        {orders !== null && (
          orders.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <h2 className="text-lg font-semibold text-foreground mb-1">No tickets found</h2>
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t find any tickets for that email. Check the address and try again.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, oi) =>
                order.tickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id ?? `${oi}-${ticket.ticketNumber}`}
                    ticket={ticket}
                    event={order.event}
                    orderTotal={order.total}
                    orderQuantity={order.quantity}
                  />
                )),
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

