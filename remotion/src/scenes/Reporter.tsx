import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";
import { LowerThird, Vignette } from "../components/Chrome";

const REP_FRAMES = 304;

export const Reporter: React.FC<{
  startFrom: number;
  kicker: string;
  title: string;
  zoom?: number;
}> = ({ startFrom, kicker, title, zoom = 1.06 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 240], [1.0, zoom], { extrapolateRight: "clamp" });
  const idx = ((startFrom + frame) % REP_FRAMES) + 1;
  const name = `f${String(idx).padStart(4, "0")}.jpg`;
  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <Img
          src={staticFile(`media/rep/${name}`)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      {/* mask the source studio's own baked-in lower-third graphics */}
      <AbsoluteFill
        style={{
          top: "auto",
          bottom: 0,
          height: 320,
          background: `linear-gradient(to bottom, rgba(9,10,10,0) 0%, ${COLORS.ink} 34%, ${COLORS.ink} 100%)`,
        }}
      />
      <Vignette />
      <LowerThird kicker={kicker} title={title} />
    </AbsoluteFill>
  );
};
