import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#38BDF8",
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32" fill="none">
          <circle
            cx="16"
            cy="16"
            r="9.5"
            stroke="#06283D"
            strokeWidth="1.6"
            opacity="0.35"
          />
          <path d="M22.5 9.5L13.8 14.2L11 21L19.7 16.3L22.5 9.5Z" fill="#06283D" />
          <path
            d="M13.8 14.2L19.7 16.3L11 21L13.8 14.2Z"
            fill="#06283D"
            opacity="0.45"
          />
          <circle cx="16" cy="16" r="1.6" fill="#38BDF8" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
