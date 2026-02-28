import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Payment Cancelled" };

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#080808] px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-white mb-2">Payment Cancelled</h1>
        <p className="text-white/50 mb-8">
          Your payment was not completed. No charges were made. Your spot is not reserved yet.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/checkout"
            className="bg-linear-to-r from-amber-500 to-orange-600 text-white font-semibold px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-orange-500/20"
          >
            Try Again
          </Link>
          <Link
            href="/"
            className="border border-white/12 text-white/60 hover:text-white hover:border-white/25 font-semibold px-6 py-3 rounded-full transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
