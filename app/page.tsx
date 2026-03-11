import Hero from "@/components/landing/Hero";
import EventDetails from "@/components/landing/EventDetails";
import FAQ from "@/components/landing/FAQ";
import prisma from "@/lib/prisma";
import { EVENT_CONFIG } from "@/lib/config";

export const revalidate = 60;

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" });
}

async function getEvent() {
  try {
    return await prisma.event.findUnique({
      where: { slug: EVENT_CONFIG.slug },
      select: {
        totalTickets: true,
        soldTickets: true,
        isActive: true,
        date: true,
        doorsOpen: true,
        endTime: true,
        venue: true,
        address: true,
        price: true,
        highlights: true,
      },
    });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEvent();
  const totalTickets = event?.totalTickets ?? EVENT_CONFIG.totalCapacity;
  const soldTickets = event?.soldTickets ?? 0;

  const eventDate   = event?.date      ? fmtDate(event.date)      : undefined;
  const doorsOpen   = event?.doorsOpen ? fmtTime(event.doorsOpen) : undefined;
  const endTime     = event?.endTime   ? fmtTime(event.endTime)   : undefined;
  const venue       = event?.venue     ?? undefined;
  const address     = event?.address   ?? undefined;
  const price       = event?.price     ?? undefined;
  const highlights  = event?.highlights?.length ? event.highlights : undefined;
  const showAvailability = (event as Record<string, unknown> | null)?.showAvailability !== false;

  return (
    <>
      <Hero
        totalTickets={totalTickets}
        soldTickets={soldTickets}
        eventDate={eventDate}
        doorsOpen={doorsOpen}
        venue={venue}
        price={price}
        showAvailability={showAvailability}
      />
      <EventDetails
        eventDate={eventDate}
        doorsOpen={doorsOpen}
        endTime={endTime}
        venue={venue}
        address={address}
        price={price}
        highlights={highlights}
      />
      
    </>
  );
}

