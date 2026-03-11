/**
 * Seed file – populates the database with the Nepali New Year 2026 event
 * and an initial admin user.
 *
 * Run: npx prisma db seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import "dotenv/config";

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("Seeding database…");

  // ── Admin user ───────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@nepaliparty.ca";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Change_me_2026!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        name: "Event Admin",
        email: adminEmail,
        password: hashed,
        role: "ADMIN",
      },
    });
    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log("Admin already exists – skipping.");
  }

  // ── Nepali New Year 2026 event ───────────────────────────────────────────
  const eventSlug = "nepali-new-year-2026-winnipeg";
  const existingEvent = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!existingEvent) {
    await prisma.event.create({
      data: {
        title: "Nepali New Year Celebration 2026",
        slug: eventSlug,
        description: `Join the Winnipeg Nepali community for a colourful celebration of Nepali New Year 2083 BS (Bisket Jatra / Navavarsha)!

The evening features:
• Traditional & modern Nepali music and cultural performances
• Authentic Nepali food (dal bhat, sekuwa, momos, sel roti & more)
• Dance, games, and community fun
• Kids' corner with cultural activities
• Bar on-site (drinks at negotiated venue prices – pay as you go)

Dress in your finest daura-suruwal, sari, or party outfit and get ready to celebrate with your community!

Venue is fully accessible. Free parking available.`,
        shortDesc:
          "Celebrate Nepali New Year 2083 BS with the Winnipeg Nepali community – food, music, culture, and more!",
        // April 13, 2026
        date: new Date("2026-04-13T19:00:00-05:00"),
        doorsOpen: new Date("2026-04-13T18:30:00-05:00"),
        endTime: new Date("2026-04-14T00:00:00-05:00"),
        venue: "Manitoba Community Centre",
        address: "123 Portage Ave",
        city: "Winnipeg",
        province: "MB",
        country: "Canada",
        price: 1500, // $15.00 CAD in cents
        totalTickets: 200,
        soldTickets: 0,
        isActive: true,
      },
    });
    console.log("Event created: Nepali New Year 2026 Winnipeg");
  } else {
    console.log("Event already exists – skipping.");
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
