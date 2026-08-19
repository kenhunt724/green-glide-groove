import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const BAR_COUNT = 96;

/** Deterministic pseudo-waveform so SSR and hydration match. */
function waveform(seed: number) {
  const bars: number[] = [];
  let x = seed * 9301 + 49297;
  for (let i = 0; i < BAR_COUNT; i += 1) {
    x = (x * 9301 + 49297) % 233280;
    const noise = x / 233280;
    const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.7 + 0.3;
    bars.push(Math.max(0.08, Math.min(1, noise * envelope + 0.15)));
  }
  return bars;
}

function fmt(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface WaveformPlayerProps {
  seed: number;
  duration: number;
  compact?: boolean;
}

export function WaveformPlayer({ seed, duration, compact }: WaveformPlayerProps) {
  const bars = waveform(seed);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = (now - last) / 1000;
      last = now;
      setPosition((p) => {
        const next = p + delta;
        if (next >= duration) {
          setPlaying(false);
          return 0;
        }
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [playing, duration]);

  const progress = position / duration;

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? "Pause preview" : "Play preview"}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-signal transition-colors hover:bg-signal/20",
          compact ? "size-9" : "size-12",
        )}
      >
        {playing ? (
          <Pause className={compact ? "size-4" : "size-5"} />
        ) : (
          <Play className={cn(compact ? "size-4" : "size-5", "translate-x-[1px]")} />
        )}
      </button>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(position)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setPosition((p) => Math.min(duration, p + 5));
          if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPosition(((e.clientX - rect.left) / rect.width) * duration);
        }}
        className={cn(
          "group flex flex-1 cursor-pointer items-end gap-[2px] outline-none",
          compact ? "h-9" : "h-14",
        )}
      >
        {bars.map((h, i) => {
          const played = i / BAR_COUNT <= progress;
          return (
            <span
              key={i}
              style={{ height: `${h * 100}%` }}
              className={cn(
                "flex-1 rounded-full transition-colors duration-150",
                played ? "bg-signal" : "bg-muted-foreground/25 group-hover:bg-muted-foreground/40",
              )}
            />
          );
        })}
      </div>

      <span className="label-mono w-20 shrink-0 text-right tabular-nums">
        {fmt(position)} / {fmt(duration)}
      </span>
    </div>
  );
}
