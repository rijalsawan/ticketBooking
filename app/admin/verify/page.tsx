"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode } from "html5-qrcode";

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

type ScanState =
  | "idle"
  | "starting"
  | "scanning"
  | "verifying"
  | "success"
  | "error"
  | "already-used";

/*  Page  */

export default function AdminVerifyPage() {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [manualInput, setManualInput] = useState("");
  // cameraOpen = div is visible; cameraLive = stream is running
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLive, setCameraLive] = useState(false);
  const [httpsWarning, setHttpsWarning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
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

  /*  Verify a ticket number  */
  const verifyTicket = useCallback(async (ticketNumber: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setScanState("verifying");
    setResult(null);

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

  /*  Extract ticket number from QR payload  */
  const handleScan = useCallback(
    (decoded: string) => {
      let ticketNumber = decoded;
      try {
        const parsed = JSON.parse(decoded);
        if (parsed.ticketNumber) ticketNumber = parsed.ticketNumber;
      } catch {
        // raw text  use as-is
      }
      verifyTicket(ticketNumber);
    },
    [verifyTicket],
  );

  /*  Start camera: first open the div, then useEffect starts scanner  */
  const requestCamera = useCallback(() => {
    setScanState("starting");
    setResult(null);
    setCameraOpen(true); // renders the div with real dimensions
  }, []);

  /*  Once cameraOpen=true the div is in the DOM with real size  */
  useEffect(() => {
    if (!cameraOpen) return;
    let cancelled = false;

    const start = async () => {
      // Micro-delay so browser paints the visible div first
      await new Promise((r) => setTimeout(r, 80));
      if (cancelled) return;

      if (scannerRef.current) {
        try { await scannerRef.current.stop(); } catch { /* ignore */ }
        scannerRef.current = null;
      }

      const scanner = new Html5Qrcode("qr-reader");
      scannerRef.current = scanner;

      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (text) => {
            handleScan(text);
            scanner.stop().catch(() => {});
            setCameraLive(false);
            setCameraOpen(false);
          },
          () => { /* ignore per-frame failures */ },
        );
        if (!cancelled) {
          setCameraLive(true);
          setScanState("scanning");
        }
      } catch (err) {
        if (cancelled) return;
        console.error("Camera error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        const isPermission =
          msg.toLowerCase().includes("permission") ||
          msg.toLowerCase().includes("denied") ||
          msg.toLowerCase().includes("notallowed");
        setScanState("error");
        setCameraOpen(false);
        setResult({
          error: isPermission
            ? "Camera permission denied. Tap the address bar lock icon and allow camera access, then try again."
            : `Camera error: ${msg}`,
        });
      }
    };

    start();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraOpen]);

  /*  Stop camera  */
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setCameraLive(false);
    setCameraOpen(false);
    setScanState("idle");
  }, []);

  /*  Cleanup on unmount  */
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

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
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Verify Tickets
        </h1>
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
              Mobile browsers block camera on plain HTTP. Access this page via{" "}
              <code className="bg-white/10 px-1 rounded">https://</code> or use{" "}
              <code className="bg-white/10 px-1 rounded">localhost</code> in dev.
              Manual entry still works.
            </p>
          </div>
        </div>
      )}

      {/* Scanner card */}
      <div className="bg-[#111] rounded-2xl border border-white/[0.06] overflow-hidden">

        {/* Camera area  always rendered once opened so div has real dimensions */}
        <div className="relative">
          {/* The actual QR reader div  always has min-height when camera requested */}
          <div
            id="qr-reader"
            className={
              cameraOpen
                ? "w-full min-h-[300px] bg-black"
                : "w-full h-0 overflow-hidden"
            }
          />

          {/* Placeholder overlay  shown when cam not open */}
          {!cameraOpen && (
            <div className="flex flex-col items-center justify-center py-14 px-6">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-white/15"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
              </div>
              <p className="text-sm text-white/25 mb-5 text-center">
                Point your camera at a ticket QR code
              </p>
              <button
                onClick={requestCamera}
                disabled={httpsWarning}
                className="bg-amber-500 hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-black text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Open Camera
              </button>
            </div>
          )}

          {/* Starting spinner overlay */}
          {cameraOpen && !cameraLive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10 pointer-events-none">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                <p className="text-xs text-white/40">Starting camera</p>
              </div>
            </div>
          )}

          {/* Close button */}
          {cameraOpen && (
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white/70 hover:text-white text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer z-20"
            >
              Close
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 px-5 py-3">
          <div className="flex-1 h-px bg-white/[0.06]" />
          <span className="text-[11px] text-white/20 uppercase tracking-wider">
            or enter manually
          </span>
          <div className="flex-1 h-px bg-white/[0.06]" />
        </div>

        {/* Manual input */}
        <form onSubmit={handleManualSubmit} className="px-5 pb-5">
          <div className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value.toUpperCase())}
              placeholder="NNY2026-0001"
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/30 transition-colors font-mono uppercase"
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

      {/* Verifying spinner */}
      {scanState === "verifying" && (
        <div className="bg-[#111] rounded-2xl border border-white/[0.06] p-8 text-center">
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
              Scan Another
            </button>
            {!cameraOpen && (
              <>
                <span className="text-white/10"></span>
                <button
                  onClick={() => { resetScan(); requestCamera(); }}
                  className="text-sm text-amber-400/70 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Reopen Camera
                </button>
              </>
            )}
          </div>
        </div>
      )}
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