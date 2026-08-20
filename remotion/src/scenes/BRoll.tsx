import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";
import { LowerThird, Vignette } from "../components/Chrome";

export const BRoll: React.FC<{
  image: string;
  kicker: string;
  title: string;
  chips?: string[];
  pan?: "left" | "right";
}> = ({ image, kicker, title, chips = [], pan = "right" }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 300], [1.02, 1.12], { extrapolateRight: "clamp" });
  const x = interpolate(frame, [0, 300], pan === "right" ? [-24, 24] : [24, -24], {
    extrapolateRight: "clamp",
  });
  const fade = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: COLORS.ink, opacity: fade }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${x}px)` }}>
        <Img
          src={staticFile(`media/${image}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(90deg, rgba(5,7,6,0.86) 0%, rgba(5,7,6,0.35) 45%, rgba(5,7,6,0.1) 100%)",
        }}
      />
      <Vignette />

      <div style={{ position: "absolute", left: 76, top: 120, display: "flex", gap: 14 }}>
        {chips.map((c, i) => {
          const local = frame - 18 - i * 9;
          const op = interpolate(local, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const y = interpolate(local, [0, 14], [22, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={c}
              style={{
                opacity: op,
                transform: `translateY(${y}px)`,
                border: `1px solid ${COLORS.emerald}`,
                color: COLORS.emerald,
                background: "rgba(5,7,6,0.72)",
                padding: "10px 18px",
                fontFamily: "monospace",
                letterSpacing: 2,
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>

      <LowerThird kicker={kicker} title={title} />
    </AbsoluteFill>
  );
};
