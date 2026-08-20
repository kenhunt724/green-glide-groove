import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Img, staticFile } from "remotion";
import { COLORS } from "../theme";
import timeline from "../timeline.json";

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(120% 80% at 50% 35%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
    }}
  />
);

export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity: 0.06,
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 1px, transparent 1px, transparent 3px)",
        transform: `translateY(${(frame % 3) - 1}px)`,
        mixBlendMode: "overlay",
      }}
    />
  );
};

export const NewsBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const rise = interpolate(frame, [10, 34], [140, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fall = interpolate(frame, [durationInFrames - 24, durationInFrames], [0, 140], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tickerX = -((frame / fps) * 130) % 2600;
  const pulse = 0.55 + 0.45 * Math.sin(frame / 7);

  const ticker =
    "EARTH PROTECTION SOCIETY  ·  BLOCK-BUILT LiFePO4 POWER  ·  0 dB ENGINE  ·  0 ppm CO  ·  OVERNIGHT CHARGING AT ~2.3¢/kWh  ·  ALTERNATOR CHARGING WHILE YOU DRIVE  ·  EARTHRESONANCEHUB.COM  ·  ";

  return (
    <AbsoluteFill style={{ transform: `translateY(${rise + fall}px)`, justifyContent: "flex-end" }}>
      <div style={{ display: "flex", alignItems: "stretch", height: 74 }}>
        <div
          style={{
            background: COLORS.copper,
            color: COLORS.ink,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "0 34px",
            fontFamily: "monospace",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: 3,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 99,
              background: "#7A1414",
              opacity: pulse,
            }}
          />
          LIVE
        </div>
        <div
          style={{
            flex: 1,
            background: "rgba(5,7,6,0.92)",
            borderTop: `2px solid ${COLORS.copper}`,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              whiteSpace: "nowrap",
              transform: `translateX(${tickerX}px)`,
              color: COLORS.bone,
              fontFamily: "monospace",
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            {ticker.repeat(6)}
          </div>
        </div>
      </div>
      <div style={{ height: 10, background: COLORS.ink }} />
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{ kicker: string; title: string }> = ({ kicker, title }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [0, 18], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [0, 20], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        bottom: 320,
        transform: `translateY(${y}px)`,
        clipPath: `inset(0 ${100 - w}% 0 0)`,
      }}
    >
      <div
        style={{
          fontFamily: "monospace",
          letterSpacing: 5,
          fontSize: 20,
          color: COLORS.ink,
          background: COLORS.amber,
          display: "inline-block",
          padding: "8px 16px",
          fontWeight: 700,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          marginTop: 10,
          background: "rgba(5,7,6,0.88)",
          borderLeft: `6px solid ${COLORS.copper}`,
          padding: "18px 30px",
          color: COLORS.bone,
          fontSize: 46,
          fontWeight: 800,
          letterSpacing: -0.5,
          maxWidth: 1180,
          fontFamily: "sans-serif",
        }}
      >
        {title}
      </div>
    </div>
  );
};

export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const cap = (timeline.captions as { text: string; start: number; end: number }[]).find(
    (c) => t >= c.start - 0.15 && t <= c.end + 0.25,
  );
  if (!cap) return null;
  const local = t - cap.start;
  const op = interpolate(local, [-0.15, 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 118,
        display: "flex",
        justifyContent: "center",
        opacity: op,
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          textAlign: "center",
          background: "rgba(5,7,6,0.82)",
          border: `1px solid ${COLORS.rule}`,
          padding: "14px 28px",
          color: COLORS.bone,
          fontSize: 34,
          lineHeight: 1.3,
          fontFamily: "sans-serif",
          fontWeight: 600,
        }}
      >
        {cap.text}
      </div>
    </div>
  );
};

export const QrCard: React.FC<{ compact?: boolean }> = ({ compact }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = interpolate(frame, [0, 14], [0.82, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const op = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const float = Math.sin(frame / 24) * 5;
  const size = compact ? 190 : 300;
  return (
    <div
      style={{
        position: "absolute",
        right: 84,
        top: compact ? 120 : 210,
        transform: `scale(${pop}) translateY(${float}px)`,
        opacity: op,
        background: COLORS.bone,
        padding: 20,
        border: `4px solid ${COLORS.copper}`,
        boxShadow: "0 30px 60px rgba(0,0,0,0.55)",
        textAlign: "center",
      }}
    >
      <Img src={staticFile("media/qr.png")} style={{ width: size, height: size, display: "block" }} />
      <div
        style={{
          marginTop: 12,
          fontFamily: "monospace",
          fontWeight: 700,
          letterSpacing: 2,
          color: COLORS.ink,
          fontSize: compact ? 16 : 22,
        }}
      >
        SCAN · EARTHRESONANCEHUB.COM
      </div>
      <div
        style={{
          marginTop: 6,
          height: 4,
          background: COLORS.copper,
          width: `${interpolate(Math.min(frame / fps, 3), [0, 3], [10, 100])}%`,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      />
    </div>
  );
};
