/**
 * Central application configuration.
 * Change these values to update event details without touching other files.
 */

export const EVENT_CONFIG = {
  title: "Nepali New Year Celebration 2026",
  nepaliTitle: "नेपाली नयाँ वर्ष उत्सव २०८२",
  slug: "nepali-new-year-2026-winnipeg",
  date: "April 12, 2026",
  nepaliDate: "बैशाख १, २०८३",
  doorsOpen: "8:00 PM CST",
  startTime: "2:00 AM CST",
  endTime: "Midnight",
  venue: "Savanna Club",
  address: "171 Dumoulin Street, Winnipeg, MB R3B 0R4",
  mapsUrl: "https://maps.google.com/?q=171+Dumoulin+Street+Winnipeg+MB",
  
  ticketPrice: 15, // CAD
  maxTicketsPerOrder: 10,
  totalCapacity: 200,
  taxRate: 0.05, // 5% GST Manitoba
  currency: "cad",
  highlights: [
    "🎵 Live traditional & modern Nepali music",
    "🍛 Authentic Nepali food",
    "💃 Cultural performances & dance",
    "🎮 Games & community activities",
    "🍺 Bar on-site at negotiated venue prices",
  ],
  faq: [
    {
      q: "What is Nepali New Year?",
      a: "Nepali New Year (Nava Varsha) marks the first day of Baisakh, the first month of the Bikram Sambat calendar. In 2026, we celebrate on April 13, beginning year 2083 BS.",
    },
    {
      q: "Is this event family-friendly?",
      a: "Absolutely! All ages are welcome. There will be a kids' corner with cultural activities.",
    },
    {
      q: "Is there parking?",
      a: "Yes, free parking is available at the venue.",
    },
    {
      q: "Can I get a refund?",
      a: "Refunds are available up to 7 days before the event (April 6, 2026). Contact us after purchase for assistance.",
    },
    {
      q: "What should I wear?",
      a: "Traditional Nepali attire (daura-suruwal, sari, kurta) is encouraged but not required. Party/smart casual is perfectly fine!",
    },
    {
      q: "Is there a bar?",
      a: "Yes – the venue has a bar with drinks sold at specially negotiated prices just for our event. You pay for your own drinks at the bar.",
    },
  ],
} as const;

export const SITE_CONFIG = {
  name: "Nepali New Year Winnipeg",
  description:
    "Buy tickets for the Nepali New Year 2082 BS celebration in Winnipeg, Manitoba, Canada. Join the community for food, music, and culture.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ogImage: "/og-image.jpg",
  contactEmail: "info@nepaliparty.ca",
  socialLinks: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
    twitter: "https://twitter.com/",
  },
} as const;
