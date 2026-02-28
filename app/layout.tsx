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
import { AuthModalProvider } from "@/components/auth/AuthModalContext";
import AuthModal from "@/components/auth/AuthModal";

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
    "Nava Varsha 2082",
    "Nepali community Winnipeg",
    "Nepali event Manitoba",
    "Baisakh 2082",
    "Nepali party Winnipeg 2026",
  ],
  openGraph: {
    title: `${EVENT_CONFIG.title} – Winnipeg`,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    images: [{ url: `${SITE_CONFIG.url}/og-image.jpg`, width: 1200, height: 630 }],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT_CONFIG.title} – Winnipeg`,
    description: SITE_CONFIG.description,
    images: [`${SITE_CONFIG.url}/og-image.jpg`],
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
            <AuthModalProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <AuthModal />
            </AuthModalProvider>
          </Suspense>
          
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: "8px", fontFamily: "var(--font-geist-sans)", background: "#1a1a1a", color: "#e8e0d8", border: "1px solid rgba(255,255,255,0.06)" },
              success: { iconTheme: { primary: "#f59e0b", secondary: "#fff" } },
            }}
          />
        </SessionProvider>

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
