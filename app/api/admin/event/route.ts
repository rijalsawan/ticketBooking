/**
 * PATCH /api/admin/event
 * Update event details. Admin only.
 */
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateEventSchema } from "@/lib/validations";
import { EVENT_CONFIG } from "@/lib/config";

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateEventSchema.safeParse(body);
  if (!parsed.success) {
    const errs = parsed.error.flatten();
    const field = Object.entries(errs.fieldErrors)[0];
    const msg = field ? `${field[0]}: ${field[1]?.[0]}` : (errs.formErrors[0] ?? "Invalid input");
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const {
    title, shortDesc, description, venue, address,
    date, doorsOpen, endTime, price, totalTickets, isActive, showAvailability, highlights,
  } = parsed.data;

  const event = await prisma.event.update({
    where: { slug: EVENT_CONFIG.slug },
    data: {
      title,
      ...(shortDesc !== undefined ? { shortDesc } : {}),
      description,
      venue,
      address,
      date: new Date(date),
      ...(doorsOpen ? { doorsOpen: new Date(doorsOpen) } : {}),
      ...(endTime   ? { endTime:   new Date(endTime)   } : {}),
      price,
      totalTickets,
      isActive,
      ...(showAvailability !== undefined ? { showAvailability } : {}),
      highlights,
    },
  });

  revalidatePath("/");
  return NextResponse.json({ event });
}
