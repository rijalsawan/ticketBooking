import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#7F1D1D",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Outer petals */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute",
              width: 28,
              height: 52,
              borderRadius: "50%",
              background: deg % 90 === 0 ? "#FBBF24" : "#FDE68A",
              transformOrigin: "50% 100%",
              transform: `rotate(${deg}deg) translateX(-50%)`,
              top: 18,
              left: "50%",
            }}
          />
        ))}
        {/* Inner petals */}
        {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
          <div
            key={deg}
            style={{
              position: "absolute",
              width: 20,
              height: 36,
              borderRadius: "50%",
              background: "#F59E0B",
              transformOrigin: "50% 100%",
              transform: `rotate(${deg}deg) translateX(-50%)`,
              top: 28,
              left: "50%",
            }}
          />
        ))}
        {/* Center circles */}
        <div
          style={{
            position: "absolute",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "#991B1B",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "#FDE68A",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#B91C1C",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
