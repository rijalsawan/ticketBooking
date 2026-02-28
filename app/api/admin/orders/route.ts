/**
 * GET  /api/admin/orders       – paginated list of orders
 * Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") ?? "20"));
    const status = searchParams.get("status") ?? undefined;
    const search = searchParams.get("q") ?? undefined;

    const where = {
      ...(status ? { status: status as "PENDING" | "COMPLETED" | "CANCELLED" | "REFUNDED" } : {}),
      ...(search
        ? {
            OR: [
              { guestEmail: { contains: search, mode: "insensitive" as const } },
              { guestName: { contains: search, mode: "insensitive" as const } },
              { id: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          event: { select: { title: true, date: true } },
          tickets: { select: { ticketNumber: true, isUsed: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error("[ADMIN ORDERS]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
