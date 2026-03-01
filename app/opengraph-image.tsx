import { ImageResponse } from "next/og";
import { EVENT_CONFIG } from "@/lib/config";

export const runtime = "edge";
export const alt = "Nepali New Year Celebration 2026 – Winnipeg";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0A",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background crimson glow — large blurry circle */}
        <div
          style={{
            position: "absolute",
            width: 1000,
            height: 1000,
            borderRadius: "50%",
            background: "rgba(127,29,29,0.22)",
            top: -350,
            left: 100,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "rgba(245,158,11,0.06)",
            bottom: -300,
            right: 50,
            display: "flex",
          }}
        />

        {/* Top stripe */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #7F1D1D 0%, #F59E0B 50%, #7F1D1D 100%)",
            display: "flex",
          }}
        />
        {/* Bottom stripe */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "linear-gradient(90deg, #7F1D1D 0%, #F59E0B 50%, #7F1D1D 100%)",
            display: "flex",
          }}
        />
        {/* Left border */}
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 0,
            bottom: 8,
            width: 4,
            background: "rgba(245,158,11,0.18)",
            display: "flex",
          }}
        />
        {/* Right border */}
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 0,
            bottom: 8,
            width: 4,
            background: "rgba(245,158,11,0.18)",
            display: "flex",
          }}
        />

        {/* Location badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(245,158,11,0.10)",
            border: "1px solid rgba(245,158,11,0.22)",
            borderRadius: 100,
            paddingLeft: 22,
            paddingRight: 22,
            paddingTop: 9,
            paddingBottom: 9,
            marginBottom: 30,
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "#F59E0B",
              display: "flex",
            }}
          />
          <span
            style={{
              fontSize: 17,
              color: "#F59E0B",
              letterSpacing: 5,
              fontWeight: 600,
            }}
          >
            WINNIPEG, MANITOBA
          </span>
        </div>

        {/* Main title line 1 */}
        <div
          style={{
            display: "flex",
            fontSize: 90,
            fontWeight: 800,
            color: "white",
            letterSpacing: -3,
            lineHeight: 0.95,
          }}
        >
          Nepali New Year
        </div>

        {/* Main title line 2 — year in amber */}
        <div
          style={{
            display: "flex",
            fontSize: 90,
            fontWeight: 800,
            color: "#F59E0B",
            letterSpacing: -3,
            lineHeight: 0.95,
            marginBottom: 40,
          }}
        >
          Celebration 2026
        </div>

        {/* Ornamental divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 40,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B91C1C", display: "flex" }} />
          <div style={{ width: 90, height: 2, background: "rgba(255,255,255,0.08)", display: "flex" }} />
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B", display: "flex" }} />
          <div style={{ width: 90, height: 2, background: "rgba(255,255,255,0.08)", display: "flex" }} />
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#B91C1C", display: "flex" }} />
        </div>

        {/* Event details row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 52,
          }}
        >
          {/* Date */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 4 }}>DATE</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
              {EVENT_CONFIG.date}
            </span>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 52, background: "rgba(255,255,255,0.08)", display: "flex" }} />

          {/* Venue */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 4 }}>VENUE</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
              {EVENT_CONFIG.venue}
            </span>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 52, background: "rgba(255,255,255,0.08)", display: "flex" }} />

          {/* Doors */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: 4 }}>DOORS</span>
            <span style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
              {EVENT_CONFIG.doorsOpen}
            </span>
          </div>
        </div>

        {/* Bottom-right website watermark */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 56,
            fontSize: 17,
            color: "rgba(255,255,255,0.2)",
            display: "flex",
          }}
        >
          nepaliparty.ca
        </div>

        {/* Bottom-left Nepali year */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: 56,
            fontSize: 17,
            color: "rgba(245,158,11,0.4)",
            display: "flex",
          }}
        >
          नयाँ वर्ष २०८२
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
