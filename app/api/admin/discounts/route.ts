/**
 * GET  /api/admin/discounts  – list all codes
 * POST /api/admin/discounts  – create a new code
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createDiscountCodeSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const codes = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });

  return NextResponse.json({ codes });
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  // Auto-uppercase the code before validation
  if (body.code) body.code = body.code.toUpperCase();

  const parsed = createDiscountCodeSchema.safeParse(body);
  if (!parsed.success) {
    const errs = parsed.error.flatten();
    const field = Object.entries(errs.fieldErrors)[0];
    const msg = field ? `${field[0]}: ${field[1]?.[0]}` : (errs.formErrors[0] ?? "Invalid input");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { code, description, value, minGroupSize, maxUses, expiresAt, isActive } = parsed.data;

  // Check uniqueness
  const existing = await prisma.discountCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A code with that name already exists" }, { status: 409 });
  }

  const discountCode = await prisma.discountCode.create({
    data: {
      code,
      description,
      value,
      minGroupSize,
      maxUses: maxUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive,
    },
  });

  return NextResponse.json({ ...discountCode, _count: { orders: 0 } }, { status: 201 });
}
