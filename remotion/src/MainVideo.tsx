import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { COLORS } from "../src/theme";
import { Reporter } from "./scenes/Reporter";
import { BRoll } from "./scenes/BRoll";
import { Captions, Grain, NewsBar, QrCard } from "./components/Chrome";

const s = (sec: number) => Math.round(sec * 30);

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Audio src={staticFile("media/vo.wav")} />

      <Sequence from={0} durationInFrames={s(9.9)}>
        <Reporter
          startFrom={0}
          kicker="BLOCK REPORT · LIVE"
          title="Neighborhoods are building their own power"
        />
      </Sequence>

      <Sequence from={s(9.9)} durationInFrames={s(11.5)}>
        <BRoll
          image="generator-photo.jpg"
          kicker="THE UNIT"
          title="Gas-generator hardware. LiFePO4 heart."
          chips={["0 dB ENGINE", "0 ppm CO", "OUTLASTS GAS BY YEARS"]}
          pan="right"
        />
      </Sequence>

      <Sequence from={s(21.4)} durationInFrames={s(7.1)}>
        <BRoll
          image="mobile-generator.jpg"
          kicker="CHARGING"
          title="Overnight at the cheapest rate — or off your alternator"
          chips={["~2.3¢/kWh OVERNIGHT", "ALTERNATOR CHARGE", "ROOFTOP SOLAR"]}
          pan="left"
        />
      </Sequence>

      <Sequence from={s(28.5)} durationInFrames={s(6.9)}>
        <BRoll
          image="glider-truck.jpg"
          kicker="FIRST OF MANY"
          title="Bringing the economy back to the block"
          chips={["COMMUNITY BUILT", "LOCAL TECHNICIAN JOBS"]}
          pan="right"
        />
      </Sequence>

      <Sequence from={s(35.4)} durationInFrames={s(7.2)}>
        <Reporter
          startFrom={s(3)}
          kicker="SCAN TO VISIT"
          title="EARTHRESONANCEHUB.COM"
          zoom={1.03}
        />
      </Sequence>

      {/* QR: compact teaser, then hero card for the call-out */}
      <Sequence from={s(21.4)} durationInFrames={s(14)}>
        <QrCard compact />
      </Sequence>
      <Sequence from={s(35.4)} durationInFrames={s(7.2)}>
        <QrCard />
      </Sequence>

      <NewsBar />
      <Captions />
      <Grain />
    </AbsoluteFill>
  );
};
