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
        <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">
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
          <div key={label} className="bg-white/[0.03] rounded-2xl border border-white/6 p-5">
            <div className={`${bg} w-10 h-10 rounded-xl flex items-center justify-center mb-3`}>
              <div className={`w-4 h-4 rounded-full ${bg}`} />
            </div>
            <p className="text-xs text-white/40 font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-extrabold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 p-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-white">Ticket Availability</h3>
          <span className="text-sm text-white/40">
            {remaining} remaining of {event?.totalTickets}
          </span>
        </div>
        <div className="bg-white/5 rounded-full h-4 overflow-hidden">
          <div
            className="bg-linear-to-r from-amber-500 to-orange-600 h-4 rounded-full transition-all"
            style={{ width: `${percentSold}%` }}
          />
        </div>
        <p className="text-xs text-white/30 mt-2">{percentSold}% sold</p>
      </div>

      {/* Recent orders table */}
      <div className="bg-white/[0.03] rounded-2xl border border-white/6 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6">
          <h3 className="font-semibold text-white">Recent Orders</h3>
          <Link href="/admin/orders" className="text-sm text-amber-400 hover:underline font-medium">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02] text-xs text-white/40 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 text-left">Buyer</th>
                <th className="px-4 py-3 text-left">Tickets</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/4">
              {recentOrders.map((order) => {
                const name = order.user?.name ?? order.guestName ?? "Guest";
                const email = order.user?.email ?? order.guestEmail ?? "—";
                return (
                  <tr key={order.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{name}</p>
                      <p className="text-xs text-white/30">{email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-amber-400">×{order.quantity}</p>
                      <p className="text-xs text-white/30">
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
                        className="text-xs text-amber-400 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-white/30 text-sm">
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
