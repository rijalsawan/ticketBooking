import { Metadata } from "next";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Badge from "@/components/ui/Badge";
import { EVENT_CONFIG } from "@/lib/config";
import Link from "next/link";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getStats() {
  const [revenue, ticketsSold, totalOrders, refunded, recentOrders, event] =
    await Promise.all([
      prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
      prisma.ticket.count(),
      prisma.order.count({ where: { status: "COMPLETED" } }),
      prisma.order.count({ where: { status: "REFUNDED" } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          tickets: { select: { ticketNumber: true } },
          payment: { select: { status: true } },
        },
      }),
      prisma.event.findUnique({
        where: { slug: EVENT_CONFIG.slug },
        select: { totalTickets: true, soldTickets: true, title: true },
      }),
    ]);

  return { revenue, ticketsSold, totalOrders, refunded, recentOrders, event };
}

const statusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  COMPLETED: "success",
  PENDING: "warning",
  REFUNDED: "neutral",
  CANCELLED: "error",
};

export default async function AdminDashboardPage() {
  const { revenue, ticketsSold, totalOrders, refunded, recentOrders, event } =
    await getStats();

  const totalRevenue = revenue._sum.amount ?? 0;
  const remaining = event ? event.totalTickets - event.soldTickets : 0;
  const percentSold = event ? Math.round((event.soldTickets / event.totalTickets) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time overview of {event?.title ?? "event"} ticket sales
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "Tickets Sold",
            value: `${ticketsSold} / ${event?.totalTickets ?? 200}`,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Completed Orders",
            value: totalOrders,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Refunded",
            value: refunded,
            color: "text-orange-400",
            bg: "bg-orange-500/10",
          },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className="bg-card rounded-md border border-border p-5">
            <div className={`${bg} w-10 h-10 rounded-md flex items-center justify-center mb-3`}>
              <div className={`w-4 h-4 rounded-full ${bg}`} />
            </div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="bg-card rounded-md border border-border p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-foreground">Ticket Availability</h3>
          <span className="text-sm text-muted-foreground">
            {remaining} remaining of {event?.totalTickets}
          </span>
        </div>
        <div className="bg-secondary rounded-full h-4 overflow-hidden">
          <div
            className="bg-accent h-4 rounded-full transition-all"
            style={{ width: `${percentSold}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">{percentSold}% sold</p>
      </div>

      {/* Recent orders table */}
      <div className="bg-card rounded-md border border-border overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-foreground">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm text-accent hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Tickets</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => {
                const name = order.user?.name ?? order.guestName ?? "Guest";
                const email = order.user?.email ?? order.guestEmail ?? "—";
                return (
                  <tr key={order.id} className="hover:bg-secondary/50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{name}</p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-accent">×{order.quantity}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.tickets[0]?.ticketNumber ?? "–"}
                        {order.quantity > 1 ? ` +${order.quantity - 1}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[order.status] ?? "neutral"}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders?q=${order.id}`}
                        className="text-xs text-accent hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                    No orders yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
