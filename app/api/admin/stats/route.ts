/**
 * GET /api/admin/stats
 * Returns dashboard stats: revenue, tickets sold, recent orders.
 * Admin only.
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [revenue, ticketsSold, totalOrders, recentOrders] = await Promise.all([
      // Total revenue from completed payments
      prisma.payment.aggregate({
        where: { status: "PAID" },
        _sum: { amount: true },
      }),

      // Total tickets sold
      prisma.ticket.count(),

      // Total completed orders
      prisma.order.count({ where: { status: "COMPLETED" } }),

      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          event: { select: { title: true } },
          user: { select: { name: true, email: true } },
          payment: { select: { status: true } },
          tickets: { select: { ticketNumber: true } },
        },
      }),
    ]);

    return NextResponse.json({
      totalRevenue: revenue._sum.amount ?? 0,
      ticketsSold,
      totalOrders,
      recentOrders,
    });
  } catch (err) {
    console.error("[ADMIN STATS]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
