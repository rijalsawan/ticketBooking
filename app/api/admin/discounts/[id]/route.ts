/**
 * PATCH  /api/admin/discounts/[id]  – toggle active
 * DELETE /api/admin/discounts/[id]  – delete code
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  return (session?.user as { role?: string })?.role === "ADMIN";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { isActive } = await req.json();

  const code = await prisma.discountCode.update({
    where: { id },
    data: { isActive },
  });

  return NextResponse.json({ code });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.discountCode.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
