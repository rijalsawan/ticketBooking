"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5QrcodeScanner, Html5QrcodeScanType } from "html5-qrcode";

/*  Types  */

interface TicketInfo {
  ticketNumber: string;
  holderName: string;
  holderEmail: string | null;
  isUsed: boolean;
  usedAt: string | null;
  event: { title: string; date: string; venue: string; address: string };
}

interface VerifyResult {
  valid?: boolean;
  message?: string;
  error?: string;
  ticket?: TicketInfo;
}

type ScanState = "idle" | "scanning" | "verifying" | "success" | "error" | "already-used";

/*  Page  */

export default function AdminVerifyPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [httpsWarning, setHttpsWarning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const processingRef = useRef(false);

  /*  HTTPS check  */
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "http:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      setHttpsWarning(true);
    }
  }, []);

  /*  Verify ticket number via API  */
  const verifyTicket = useCallback(async (ticketNumber: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setScanState("verifying");
    setResult(null);

    // Stop the scanner while we verify
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
      setCameraOpen(false);
    }

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber }),
      });
      const data: VerifyResult = await res.json();

      if (data.valid) {
        setScanState("success");
      } else if (data.ticket?.isUsed) {
        setScanState("already-used");
      } else {
        setScanState("error");
      }
      setResult(data);
    } catch {
      setScanState("error");
      setResult({ error: "Network error  check your connection" });
    } finally {
      processingRef.current = false;
    }
  }, []);

  /*  Parse QR payload and extract ticket number  */
  const handleDecoded = useCallback(
    (text: string) => {
      if (processingRef.current) return;
      let ticketNumber = text.trim();
      try {
        const parsed = JSON.parse(text);
        if (parsed.ticketNumber) ticketNumber = parsed.ticketNumber;
      } catch {
        // plain text  use as-is
      }
      verifyTicket(ticketNumber);
    },
    [verifyTicket],
  );

  /*  Mount the scanner once cameraOpen becomes true  */
  useEffect(() => {
    if (!cameraOpen) return;

    // Small delay to ensure the div is painted
    const timer = setTimeout(() => {
      if (scannerRef.current) return; // already mounted

      const scanner = new Html5QrcodeScanner(
        "qr-reader-container",
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          rememberLastUsedCamera: true,
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          showTorchButtonIfSupported: true,
        },
        /* verbose= */ false,
      );

      scanner.render(
        (text) => {
          handleDecoded(text);
        },
        (_error) => {
          // per-frame decode failure  ignore
        },
      );

      scannerRef.current = scanner;
      setScanState("scanning");
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [cameraOpen, handleDecoded]);

  /*  Cleanup on unmount  */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, []);

  /*  Open camera  */
  const openCamera = () => {
    setResult(null);
    setScanState("scanning");
    setCameraOpen(true);
  };

  /*  Close camera  */
  const closeCamera = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(() => {});
      scannerRef.current = null;
    }
    setCameraOpen(false);
    setScanState("idle");
  };

  /*  Manual submit  */
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualInput.trim();
    if (trimmed) verifyTicket(trimmed);
  };

  /*  Reset  */
  const resetScan = () => {
    setScanState("idle");
    setResult(null);
    setManualInput("");
  };

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Verify Tickets</h1>
        <p className="text-sm text-white/35 mt-1">
          Scan a QR code or enter the ticket number manually
        </p>
      </div>

      {/* HTTPS warning */}
      {httpsWarning && (
        <div className="bg-amber-500/[0.08] border border-amber-500/20 rounded-xl px-4 py-3 flex items-start gap-3">
          <svg className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
          <div>
            <p className="text-xs font-semibold text-amber-400 mb-0.5">HTTPS required for camera</p>
            <p className="text-xs text-amber-400/60">
              Mobile browsers block camera on plain HTTP. Use{" "}
              <code className="bg-white/10 px-1 rounded">https://</code> or{" "}
              <code className="bg-white/10 px-1 rounded">localhost</code>. Manual entry works without HTTPS.
            </p>
          </div>
        </div>
      )}

      {/* Camera toggle button  only shown when not open */}
      {!cameraOpen && scanState !== "verifying" && (
        <button
          onClick={openCamera}
          disabled={httpsWarning}
          className="w-full flex items-center justify-center gap-2.5 bg-[#111] hover:bg-[#1a1a1a] disabled:opacity-30 disabled:cursor-not-allowed border border-white/[0.06] rounded-2xl py-10 transition-colors cursor-pointer group"
        >
          <svg className="w-6 h-6 text-white/20 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          <span className="text-sm text-white/30 group-hover:text-white/60 transition-colors">Open Camera Scanner</span>
        </button>
      )}

      {/* Scanner container  rendered when open */}
      {cameraOpen && (
        <div className="bg-[#111] rounded-2xl border border-white/[0.06] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm text-white/50 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Camera active  point at QR code
            </span>
            <button
              onClick={closeCamera}
              className="text-xs text-white/30 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
          {/* html5-qrcode mounts here */}
          <div id="qr-reader-container" className="w-full" />
        </div>
      )}

      {/* Verifying spinner */}
      {scanState === "verifying" && (
        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-10 text-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-white/40">Verifying ticket</p>
        </div>
      )}

      {/* Result card */}
      {result && scanState !== "verifying" && (
        <div
          className={`rounded-2xl border overflow-hidden ${
            scanState === "success"
              ? "bg-emerald-500/[0.05] border-emerald-500/20"
              : scanState === "already-used"
                ? "bg-amber-500/[0.05] border-amber-500/20"
                : "bg-red-500/[0.05] border-red-500/20"
          }`}
        >
          {/* Status header */}
          <div className="px-5 py-4 flex items-center gap-3">
            {scanState === "success" ? (
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : scanState === "already-used" ? (
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
                </svg>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            )}
            <div>
              <p
                className={`text-sm font-semibold ${
                  scanState === "success"
                    ? "text-emerald-400"
                    : scanState === "already-used"
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {result.message || result.error}
              </p>
              {result.ticket && (
                <p className="text-xs text-white/30 mt-0.5 font-mono">
                  {result.ticket.ticketNumber}
                </p>
              )}
            </div>
          </div>

          {/* Ticket details */}
          {result.ticket && (
            <div className="border-t border-white/[0.06] px-5 py-4 space-y-2">
              <DetailRow label="Attendee" value={result.ticket.holderName} />
              {result.ticket.holderEmail && (
                <DetailRow label="Email" value={result.ticket.holderEmail} />
              )}
              <DetailRow label="Event" value={result.ticket.event.title} />
              <DetailRow label="Venue" value={result.ticket.event.venue} />
            </div>
          )}

          {/* Actions */}
          <div className="border-t border-white/[0.06] px-5 py-3 flex gap-3">
            <button
              onClick={resetScan}
              className="text-sm text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              Clear
            </button>
            <span className="text-white/10"></span>
            <button
              onClick={() => { resetScan(); openCamera(); }}
              className="text-sm text-amber-400/70 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Scan Next
            </button>
          </div>
        </div>
      )}

      {/* Manual input  always visible */}
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] px-5 py-4">
        <p className="text-[11px] text-white/20 uppercase tracking-wider mb-3">Manual Entry</p>
        <form onSubmit={handleManualSubmit}>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              placeholder="NNY2026-0001"
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-colors font-mono"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || scanState === "verifying"}
              className="bg-white/[0.06] hover:bg-white/[0.10] disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium px-5 py-2.5 rounded-xl border border-white/[0.06] transition-all cursor-pointer"
            >
              Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/*  Helper  */

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between text-sm gap-4">
      <span className="text-white/25 shrink-0">{label}</span>
      <span className="text-white/60 text-right">{value}</span>
    </div>
  );
}