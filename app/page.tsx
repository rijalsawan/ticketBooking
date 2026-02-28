import Hero from "@/components/landing/Hero";
import EventDetails from "@/components/landing/EventDetails";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";

export const revalidate = 60;

async function getEvent() {
  try {
    return await prisma.event.findUnique({
      where: { slug: EVENT_CONFIG.slug },
      select: { totalTickets: true, soldTickets: true, isActive: true },
    });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEvent();
  const totalTickets = event?.totalTickets ?? EVENT_CONFIG.totalCapacity;
  const soldTickets = event?.soldTickets ?? 0;

  return (
    <>
      <Hero totalTickets={totalTickets} soldTickets={soldTickets} />
      <EventDetails />
      
    </>
  );
}

