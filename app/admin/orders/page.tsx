"use client";

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { formatPrice, formatDate } from "@/lib/utils";

interface Order {
  id: string;
  guestEmail: string | null;
  guestName: string | null;
  quantity: number;
  total: number;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  event: { title: string; date: string };
  tickets: Array<{ ticketNumber: string; isUsed: boolean }>;
  payment: { status: string; amount: number } | null;
}

const statusVariant: Record<string, "success" | "warning" | "error" | "neutral"> = {
  COMPLETED: "success",
  PENDING: "warning",
  REFUNDED: "neutral",
  CANCELLED: "error",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refunding, setRefunding] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        ...(status ? { status } : {}),
        ...(query ? { q: query } : {}),
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
      setPages(data.pages ?? 1);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, status, query]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleRefund = async (orderId: string) => {
    if (!confirm("Are you sure you want to refund this order? This cannot be undone.")) return;
    setRefunding(orderId);
    try {
      const res = await fetch("/api/admin/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error ?? "Refund failed");
      } else {
        toast.success("Refund issued successfully");
        fetchOrders();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setRefunding(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm">{total} total orders</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="search"
            placeholder="Search by name, email, ID…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          />
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="bg-transparent border border-border rounded-md px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-ring focus:outline-none"
          >
            <option value="">All statuses</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-card rounded-md border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground text-sm">
            Loading…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary text-xs text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Buyer</th>
                  <th className="px-4 py-3 text-left">Tickets</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => {
                  const name = order.user?.name ?? order.guestName ?? "Guest";
                  const email = order.user?.email ?? order.guestEmail ?? "—";
                  return (
                    <tr key={order.id} className="hover:bg-secondary/50">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-accent">×{order.quantity}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.tickets.slice(0, 2).map((t) => (
                            <span key={t.ticketNumber} className="text-xs font-mono bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                              {t.ticketNumber}
                            </span>
                          ))}
                          {order.tickets.length > 2 && (
                            <span className="text-xs text-muted-foreground">+{order.tickets.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-foreground">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[order.status] ?? "neutral"}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {order.status === "COMPLETED" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            loading={refunding === order.id}
                            onClick={() => handleRefund(order.id)}
                            className="text-xs px-3 py-1"
                          >
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border text-sm text-muted-foreground">
            <span>Page {page} of {pages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-md border border-border hover:bg-secondary disabled:opacity-40 text-muted-foreground"
              >
                ← Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="px-3 py-1 rounded-md border border-border hover:bg-secondary disabled:opacity-40 text-muted-foreground"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
