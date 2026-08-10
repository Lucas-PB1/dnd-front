import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Ícone Apple Touch — selo Taverna. */
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
          background: "#1a1410",
          borderRadius: 36,
        }}
      >
        <div
          style={{
            width: 140,
            height: 140,
            borderRadius: 999,
            border: "6px solid #c45c3e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "inset 0 0 0 3px rgba(196,92,62,0.35)",
            color: "#c45c3e",
            fontSize: 88,
            fontWeight: 700,
            fontFamily: "Georgia, serif",
            lineHeight: 1,
          }}
        >
          T
        </div>
      </div>
    ),
    { ...size },
  );
}
