import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SITE_CONFIG, EVENT_CONFIG } from "@/lib/config";
import Script from "next/script";
import { Suspense } from "react";

import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${EVENT_CONFIG.title} – Winnipeg`,
    template: `%s | ${EVENT_CONFIG.title}`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    "Nepali New Year Winnipeg",
    "Nava Varsha 2083",
    "Nepali community Winnipeg",
    "Nepali event Manitoba",
    "Baisakh 2083",
    "Nepali party Winnipeg 2026",
  ],
  openGraph: {
    title: `${EVENT_CONFIG.title} – Winnipeg`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT_CONFIG.title} – Winnipeg`,
    description: SITE_CONFIG.description,
  },
  robots: { index: true, follow: true },
  metadataBase: new URL(SITE_CONFIG.url),
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={geistSans.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <SessionProvider>
          <Suspense>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </Suspense>
          
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "0.5rem", fontFamily: "var(--font-geist-sans)", background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" },
              success: { iconTheme: { primary: "#f59e0b", secondary: "#000" } },
            }}
          />
        </SessionProvider>

        <Analytics />

        {/* Google Analytics */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${process.env.NEXT_PUBLIC_GA_ID}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
