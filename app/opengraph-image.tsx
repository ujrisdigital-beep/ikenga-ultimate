import { ImageResponse } from "next/og";

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_TAGLINE,
} from "../src/ikenga/lib/site";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "54px",
          background:
            "radial-gradient(circle at top, rgba(242,188,54,0.18), transparent 42%), linear-gradient(180deg, #050505 0%, #121212 100%)",
          color: "#fff8dd",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div
            style={{
              width: 82,
              height: 82,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid rgba(255, 222, 121, 0.6)",
              background:
                "radial-gradient(circle at 35% 30%, rgba(255,226,145,0.95), rgba(244,190,51,0.88) 40%, rgba(17,11,1,1) 100%)",
              color: "#1b1404",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 6,
            }}
          >
            IK
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 8,
                color: "#ffd85f",
              }}
            >
              {APP_NAME}
            </div>
            <div
              style={{
                fontSize: 18,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "rgba(255, 248, 221, 0.72)",
              }}
            >
              {APP_TAGLINE}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 860,
          }}
        >
          <div
            style={{
              fontSize: 78,
              lineHeight: 1,
              fontWeight: 700,
              color: "#fff4c0",
            }}
          >
            Power your destiny across every platform.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "rgba(255, 248, 221, 0.84)",
            }}
          >
            {APP_DESCRIPTION}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
          }}
        >
          {["Creative Intelligence", "Brand Memory", "Early Access Live"].map(
            (label) => (
              <div
                key={label}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(255, 214, 84, 0.24)",
                  padding: "12px 20px",
                  fontSize: 18,
                  color: "#ffdd7b",
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
