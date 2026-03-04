/**
 * POST /api/discounts/validate
 * Validates a discount code and returns the discount info.
 * Called client-side during checkout.
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { code, quantity } = await req.json();

  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const discount = await prisma.discountCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!discount) {
    return NextResponse.json({ error: "Invalid code" }, { status: 404 });
  }

  if (!discount.isActive) {
    return NextResponse.json({ error: "This code is no longer active" }, { status: 400 });
  }

  if (discount.expiresAt && discount.expiresAt < new Date()) {
    return NextResponse.json({ error: "This code has expired" }, { status: 400 });
  }

  if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
    return NextResponse.json({ error: "This code has reached its usage limit" }, { status: 400 });
  }

  const qty = Number(quantity) || 1;
  if (qty < discount.minGroupSize) {
    return NextResponse.json(
      {
        error:
          discount.minGroupSize === 1
            ? "Code is not valid for this order"
            : `This code requires a group of at least ${discount.minGroupSize}`,
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    valid: true,
    code: discount.code,
    description: discount.description,
    value: discount.value,           // %
    minGroupSize: discount.minGroupSize,
  });
}
