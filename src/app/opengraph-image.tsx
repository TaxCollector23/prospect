import { ImageResponse } from "next/og";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: 80,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: "#38BDF8",
              borderRadius: 18,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <path
                d="M22.5 9.5L13.8 14.2L11 21L19.7 16.3L22.5 9.5Z"
                fill="#06283D"
              />
            </svg>
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#0f172a" }}>
            {APP_NAME}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#0f172a",
              lineHeight: 1.1,
              maxWidth: 900,
            }}
          >
            Discover opportunities tailored to your future.
          </div>
          <div style={{ fontSize: 32, color: "#64748b", maxWidth: 900 }}>
            Scholarships · Internships · Fellowships · Research · Grants ·
            Hackathons · Accelerators
          </div>
        </div>

        <div
          style={{
            height: 12,
            width: "100%",
            background: "#38BDF8",
            borderRadius: 999,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
