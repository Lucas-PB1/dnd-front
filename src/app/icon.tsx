import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — selo de cera com monograma T (Taverna). */
export default function Icon() {
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
          borderRadius: 6,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: "2px solid #c45c3e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#c45c3e",
            fontSize: 16,
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
