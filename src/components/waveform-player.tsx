import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume1, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { bufferAhead, usePlayerSettings } from "@/components/player-settings";

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
  label?: string;
}

export function WaveformPlayer({ seed, duration, compact, label }: WaveformPlayerProps) {
  const bars = waveform(seed);
  const { volume, zoom, buffer } = usePlayerSettings();
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
  const buffered = Math.min(1, progress + bufferAhead[buffer]);

  // Zoom: show a window of the waveform that follows the playhead.
  const windowSize = Math.max(8, Math.round(BAR_COUNT / zoom));
  const maxStart = BAR_COUNT - windowSize;
  const start = Math.max(0, Math.min(maxStart, Math.round(progress * BAR_COUNT - windowSize / 2)));
  const visible = bars.slice(start, start + windowSize);
  const windowStartRatio = start / BAR_COUNT;
  const windowEndRatio = (start + windowSize) / BAR_COUNT;

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;
  const trackLabel = label ? `${label} — ` : "";

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={`${playing ? "Pause" : "Play"} preview${label ? ` of ${label}` : ""}`}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-signal transition-colors hover:bg-signal/20 focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
          compact ? "size-11" : "size-12",
        )}
      >
        {playing ? (
          <Pause className={compact ? "size-4" : "size-5"} aria-hidden="true" />
        ) : (
          <Play
            className={cn(compact ? "size-4" : "size-5", "translate-x-[1px]")}
            aria-hidden="true"
          />
        )}
      </button>

      <div
        role="slider"
        tabIndex={0}
        aria-label={`${trackLabel}Seek`}
        aria-valuemin={0}
        aria-valuemax={duration}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${fmt(position)} of ${fmt(duration)}`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setPosition((p) => Math.min(duration, p + 5));
          if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - 5));
          if (e.key === "Home") setPosition(0);
          if (e.key === "End") setPosition(duration);
        }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = (e.clientX - rect.left) / rect.width;
          const windowed = windowStartRatio + ratio * (windowEndRatio - windowStartRatio);
          setPosition(Math.max(0, Math.min(1, windowed)) * duration);
        }}
        className={cn(
          "group flex flex-1 cursor-pointer items-end gap-[2px] outline-none focus-visible:ring-2 focus-visible:ring-signal",
          compact ? "h-11" : "h-14",
        )}
      >
        {visible.map((h, i) => {
          const ratio = (start + i) / BAR_COUNT;
          const played = ratio <= progress;
          const isBuffered = !played && ratio <= buffered;
          return (
            <span
              key={start + i}
              style={{ height: `${(h * (0.35 + volume * 0.65) * 100).toFixed(2)}%` }}
              className={cn(
                "flex-1 rounded-full transition-[background-color,height] duration-150",
                played
                  ? "bg-signal"
                  : isBuffered
                    ? "bg-signal/35"
                    : "bg-muted-foreground/25 group-hover:bg-muted-foreground/40",
              )}
            />
          );
        })}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <VolumeIcon className="size-4 text-muted-foreground" aria-hidden="true" />
        <span className="label-mono w-20 text-right tabular-nums">
          {fmt(position)} / {fmt(duration)}
        </span>
      </div>
    </div>
  );
}
