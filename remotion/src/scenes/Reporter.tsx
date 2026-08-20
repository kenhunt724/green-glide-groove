import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, interpolate } from "remotion";
import { COLORS } from "../theme";
import { LowerThird, Vignette } from "../components/Chrome";

export const Reporter: React.FC<{
  startFrom: number;
  kicker: string;
  title: string;
  zoom?: number;
}> = ({ startFrom, kicker, title, zoom = 1.06 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, 240], [1.0, zoom], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: COLORS.ink }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile("media/reporter.mp4")}
          startFrom={startFrom}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <Vignette />
      <LowerThird kicker={kicker} title={title} />
    </AbsoluteFill>
  );
};
