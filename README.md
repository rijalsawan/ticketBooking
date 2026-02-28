# 🎉 Nepali New Year Celebration 2026 – Ticketing System

A production-ready online ticketing platform for the **Nepali New Year 2082 Celebration** organized by the Nepali community in Winnipeg, Manitoba, Canada.

**Event:** April 14, 2026 · 7:00 PM CST  
**Venue:** The RBC Convention Centre, 375 York Ave, Winnipeg, MB  
**Capacity:** 200 guests · **Price:** $15 CAD + 5% GST

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL + Prisma ORM v7 |
| Auth | NextAuth v5 (Credentials + Google OAuth) |
| Payments | Stripe Checkout + Webhooks |
| Email | Nodemailer (SMTP) |
| QR Codes | qrcode.react |
| Validation | Zod v4 + React Hook Form |
| Testing | Jest + Testing Library |

---

## Features

- **Event landing page** with live availability counter, highlights, and FAQ
- **Email/password auth** + Google OAuth login
- **Stripe Checkout** with webhook-verified ticket creation
- **QR-coded tickets** emailed automatically on purchase
- **My Tickets** page with downloadable/printable tickets
- **Admin dashboard** — sales stats, order management, refunds, inventory tracking
- **SEO** optimised with Open Graph + Twitter Card metadata
- **Social sharing** (Facebook, X/Twitter, WhatsApp)
- **Security headers** (CSP, HSTS, Clickjacking protection)

---

## Prerequisites

- **Node.js** 18.17 or later
- **PostgreSQL** 14 or later (local or hosted, e.g. Supabase / Neon / Railway)
- **Stripe account** with a test API key
- **SMTP credentials** (Gmail App Password, Resend, Mailgun, etc.)
- **Google OAuth credentials** (optional, for Google sign-in)
- **Stripe CLI** (for local webhook testing)

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the template and fill in your values:

```bash
cp .env.local .env.local
```

Open `.env.local` and set every variable (see [Environment Variables](#environment-variables) below).

### 3. Set up the database

```bash
# Push the schema to your database (development)
npm run db:push

# Or use migrations (recommended for production)
npm run db:migrate

# Generate the Prisma client
npm run db:generate

# Seed the database with admin user + event record
npm run db:seed
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### 5. Set up Stripe webhooks (local testing)

Install the [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the **webhook signing secret** printed by the CLI (starts with `whsec_`) and paste it into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/ticketing` |
| `NEXTAUTH_SECRET` | Random 32+ char secret | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full URL of your app | `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Stripe secret key (test: `sk_test_…`) | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_…`) | |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_…`) | |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username / email address | |
| `SMTP_PASSWORD` | SMTP password or App Password | |
| `EMAIL_FROM` | Sender display name + address | `"Nepali NY 2026" <noreply@example.com>` |
| `ADMIN_EMAIL` | Seeded admin email | `admin@example.com` |
| `ADMIN_PASSWORD` | Seeded admin password | `Admin123!` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) | |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret (optional) | |
| `NEXT_PUBLIC_APP_URL` | Public base URL | `http://localhost:3000` |
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID (optional) | `G-XXXXXXXXXX` |

---

## Default Admin Login

After running `npm run db:seed` you can log in to the admin dashboard at `/admin` with the credentials you set in `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

> **Important:** Change the default password before deploying to production.

---

## Available Scripts

```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # ESLint check
npm test             # Run Jest unit tests

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Push schema to DB without migration history (dev only)
npm run db:migrate   # Create + apply a migration (recommended)
npm run db:seed      # Seed admin user and event record
npm run db:studio    # Open Prisma Studio (visual DB browser)
```

---

## Project Structure

```
ticketing/
├── app/
│   ├── page.tsx                  # Landing page (ISR)
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── checkout/
│   │   ├── page.tsx              # Checkout form
│   │   ├── success/page.tsx      # Post-payment success
│   │   └── cancel/page.tsx
│   ├── tickets/page.tsx          # My Tickets (auth-protected)
│   ├── admin/
│   │   ├── layout.tsx            # Admin role guard
│   │   ├── page.tsx              # Dashboard / stats
│   │   ├── orders/page.tsx       # Orders management + refunds
│   │   ├── tickets/page.tsx      # All tickets + check-in status
│   │   └── settings/page.tsx     # Event info + env status
│   └── api/
│       ├── auth/[...nextauth]/   # NextAuth handler
│       ├── auth/register/        # User registration
│       ├── checkout/             # Create Stripe session
│       ├── webhooks/stripe/      # Stripe webhook handler
│       ├── tickets/              # Get user tickets
│       └── admin/                # Stats, orders, refund endpoints
├── components/
│   ├── layout/                   # Navbar, Footer
│   ├── ui/                       # Button, Input, Badge
│   ├── landing/                  # Hero, EventDetails, FAQ, SocialShare
│   ├── auth/                     # LoginForm, RegisterForm
│   ├── checkout/                 # CheckoutForm, OrderSummary
│   └── tickets/                  # TicketCard (with QR code)
├── lib/
│   ├── auth.ts                   # NextAuth config (Credentials + Google)
│   ├── config.ts                 # EVENT_CONFIG and SITE_CONFIG
│   ├── email.ts                  # Email notification functions
│   ├── prisma.ts                 # Prisma client singleton
│   ├── stripe.ts                 # Stripe client singleton
│   ├── utils.ts                  # Helpers (pricing, formatting, etc.)
│   └── validations.ts            # Zod schemas
├── prisma/
│   ├── schema.prisma             # Database schema (7 models)
│   └── seed.ts                   # Admin user + event seed
├── types/
│   └── index.ts                  # TypeScript type augmentations
├── middleware.ts                  # Edge route protection
└── __tests__/
    └── utils.test.ts             # Unit tests for utility functions
```

---

## Stripe Payment Flow

```
User selects tickets
      ↓
POST /api/checkout  →  Creates pending Order in DB
      ↓
Stripe Checkout Session created
      ↓
User pays on Stripe-hosted page
      ↓
Stripe fires checkout.session.completed webhook
      ↓
POST /api/webhooks/stripe
  • Verifies signature
  • Marks Order as COMPLETED
  • Creates Ticket records with QR codes
  • Sends confirmation email to buyer
  • Sends notification email to admin
  • Increments Event.soldTickets
      ↓
User redirected to /checkout/success
```

---

## Deployment (Vercel)

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` in the Vercel project settings.
4. Set up a **PostgreSQL** database (Vercel Postgres, Supabase, Neon, or Railway) and set `DATABASE_URL`.
5. In your **Stripe Dashboard > Webhooks**, add an endpoint:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
   Subscribe to `checkout.session.completed` and `charge.refunded`.
6. Copy the new webhook signing secret into the `STRIPE_WEBHOOK_SECRET` env var in Vercel.
7. Run the database migration + seed from a local terminal pointing at the production DB:
   ```bash
   DATABASE_URL="<prod-connection-string>" npx prisma migrate deploy
   DATABASE_URL="<prod-connection-string>" npm run db:seed
   ```

---

## Running Tests

```bash
npm test
```

Tests live in `__tests__/` and cover pricing calculations, formatting utilities, and availability helpers.

---

## Customising the Event

Edit `lib/config.ts` to change:
- Event title, date, venue
- Ticket price, capacity, currency
- Highlights and FAQ entries
- Site name, description, and social links

The admin dashboard at `/admin/settings` shows a live view of the current configuration.

---

## License

Private project. All rights reserved © Nepali Community Winnipeg 2026.
