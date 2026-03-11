import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">Payment Cancelled</h1>
        <p className="text-muted-foreground mb-8 text-sm">
          Your payment was not completed. No charges were made.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="inline-flex items-center justify-center bg-primary text-primary-foreground font-medium px-5 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center border border-border text-muted-foreground hover:text-foreground hover:bg-secondary font-medium px-5 py-2 rounded-md text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

