import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Pause, Play, RotateCcw, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePlayerSettings } from "@/components/player-settings";
import type { AudioSample } from "@/content/audio-samples";

type Format = "mp3" | "wav";

function fmt(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface FormatABPlayerProps {
  sample: AudioSample;
  label: string;
}

/**
 * Plays both encodes in lockstep and mutes the inactive one, so switching
 * formats is instant and happens at the exact same playback position.
 */
export function FormatABPlayer({ sample, label }: FormatABPlayerProps) {
  const { volume } = usePlayerSettings();
  const mp3Ref = useRef<HTMLAudioElement | null>(null);
  const wavRef = useRef<HTMLAudioElement | null>(null);

  const [format, setFormat] = useState<Format>("mp3");
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [blind, setBlind] = useState(false);
  /** In blind mode, which hidden slot maps to the uncompressed file. */
  const [wavSlot, setWavSlot] = useState<"A" | "B">("A");
  const [guess, setGuess] = useState<"A" | "B" | null>(null);
  const [revealed, setRevealed] = useState(false);

  /** Locally loaded files (object URLs) override the hosted excerpts. */
  const [local, setLocal] = useState<{ mp3?: { url: string; name: string }; wav?: { url: string; name: string } }>(
    {},
  );

  const activeRef = format === "mp3" ? mp3Ref : wavRef;

  const loadLocal = (slot: Format, file: File | undefined) => {
    if (!file) return;
    setLocal((prev) => {
      if (prev[slot]) URL.revokeObjectURL(prev[slot]!.url);
      return { ...prev, [slot]: { url: URL.createObjectURL(file), name: file.name } };
    });
    setPlaying(false);
    setTime(0);
    setDuration(0);
    mp3Ref.current?.pause();
    wavRef.current?.pause();
  };

  const clearLocal = () => {
    setLocal((prev) => {
      for (const v of Object.values(prev)) if (v) URL.revokeObjectURL(v.url);
      return {};
    });
    setPlaying(false);
    setTime(0);
    setDuration(0);
  };

  // Release object URLs when the component goes away.
  useEffect(
    () => () => {
      for (const v of Object.values(local)) if (v) URL.revokeObjectURL(v.url);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Keep gains in sync with the global player volume.
  useEffect(() => {
    for (const ref of [mp3Ref, wavRef]) {
      if (ref.current) ref.current.volume = volume;
    }
  }, [volume]);

  // Only the selected format is audible; both keep running for gapless swaps.
  useEffect(() => {
    if (mp3Ref.current) mp3Ref.current.muted = format !== "mp3";
    if (wavRef.current) wavRef.current.muted = format !== "wav";
  }, [format]);

  const resync = useCallback(() => {
    const from = activeRef.current;
    const other = format === "mp3" ? wavRef.current : mp3Ref.current;
    if (from && other && Math.abs(other.currentTime - from.currentTime) > 0.06) {
      other.currentTime = from.currentTime;
    }
  }, [activeRef, format]);

  const toggleFormat = (next: Format) => {
    const from = activeRef.current;
    const to = next === "mp3" ? mp3Ref.current : wavRef.current;
    if (from && to) to.currentTime = from.currentTime;
    setFormat(next);
  };

  const togglePlay = async () => {
    const a = mp3Ref.current;
    const b = wavRef.current;
    if (!a || !b) return;
    if (playing) {
      a.pause();
      b.pause();
      setPlaying(false);
      return;
    }
    b.currentTime = a.currentTime;
    try {
      await Promise.all([a.play(), b.play()]);
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const seek = (ratio: number) => {
    const t = Math.max(0, Math.min(1, ratio)) * (duration || 0);
    if (mp3Ref.current) mp3Ref.current.currentTime = t;
    if (wavRef.current) wavRef.current.currentTime = t;
    setTime(t);
  };

  const startBlind = () => {
    const slot: "A" | "B" = Math.random() < 0.5 ? "A" : "B";
    setWavSlot(slot);
    setGuess(null);
    setRevealed(false);
    setBlind(true);
    setFormat(slot === "A" ? "wav" : "mp3");
  };

  const pickSlot = (slot: "A" | "B") => toggleFormat(slot === wavSlot ? "wav" : "mp3");
  const currentSlot: "A" | "B" = format === "wav" ? wavSlot : wavSlot === "A" ? "B" : "A";
  const progress = duration ? time / duration : 0;
  const usingLocal = Boolean(local.mp3 || local.wav);
  const mp3Src = local.mp3?.url ?? sample.mp3;
  const wavSrc = local.wav?.url ?? sample.wav;
  const mp3Label = local.mp3?.name ?? sample.mp3Label;
  const wavLabel = local.wav?.name ?? sample.wavLabel;

  return (
    <div className="border border-border bg-surface p-4">
      <audio
        ref={mp3Ref}
        src={mp3Src}
        preload="auto"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (format === "mp3") setTime(e.currentTarget.currentTime);
          resync();
        }}
        onEnded={() => {
          setPlaying(false);
          setTime(0);
        }}
      />
      <audio
        ref={wavRef}
        src={wavSrc}
        preload="auto"
        muted
        onLoadedMetadata={(e) => setDuration((d) => d || e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          if (format === "wav") setTime(e.currentTarget.currentTime);
        }}
      />


      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="label-mono">Hear the difference · {blind ? "Blind test" : "A/B compare"}</p>
        <button
          type="button"
          onClick={() => (blind ? setBlind(false) : startBlind())}
          className="label-mono flex min-h-9 items-center gap-2 border border-border px-3 text-muted-foreground transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
        >
          {blind ? (
            <Eye className="size-3.5" aria-hidden="true" />
          ) : (
            <EyeOff className="size-3.5" aria-hidden="true" />
          )}
          {blind ? "Show labels" : "Blind test"}
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={`${playing ? "Pause" : "Play"} format comparison for ${label}`}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-signal/50 bg-signal/10 text-signal transition-colors hover:bg-signal/20 focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
        >
          {playing ? (
            <Pause className="size-4" aria-hidden="true" />
          ) : (
            <Play className="size-4 translate-x-[1px]" aria-hidden="true" />
          )}
        </button>

        <div
          role="slider"
          tabIndex={0}
          aria-label={`${label} comparison position`}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${fmt(time)} of ${fmt(duration)}`}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") seek((time + 2) / (duration || 1));
            if (e.key === "ArrowLeft") seek((time - 2) / (duration || 1));
            if (e.key === "Home") seek(0);
          }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek((e.clientX - rect.left) / rect.width);
          }}
          className="h-11 flex-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-signal"
        >
          <div className="mt-[18px] h-1.5 w-full bg-muted-foreground/25">
            <div
              className="h-full bg-signal transition-[width] duration-100"
              style={{ width: `${(progress * 100).toFixed(2)}%` }}
            />
          </div>
        </div>

        <span className="label-mono w-20 shrink-0 text-right tabular-nums">
          {fmt(time)} / {fmt(duration)}
        </span>
      </div>

      {!blind ? (
        <div role="group" aria-label="Playback format" className="mt-4 grid gap-px bg-border sm:grid-cols-2">
          {(["mp3", "wav"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={format === f}
              onClick={() => toggleFormat(f)}
              className={cn(
                "min-h-11 bg-surface px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
                format === f ? "bg-signal/10 text-signal" : "text-muted-foreground hover:text-signal",
              )}
            >
              <span className="label-mono block">{f === "mp3" ? "Lossy" : "Uncompressed"}</span>
              <span className="mt-1 block text-sm">
                {f === "mp3" ? mp3Label : wavLabel}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div role="group" aria-label="Blind sources" className="grid gap-px bg-border sm:grid-cols-2">
            {(["A", "B"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                aria-pressed={currentSlot === slot}
                onClick={() => pickSlot(slot)}
                className={cn(
                  "min-h-11 bg-surface px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none",
                  currentSlot === slot
                    ? "bg-signal/10 text-signal"
                    : "text-muted-foreground hover:text-signal",
                )}
              >
                <span className="label-mono block">Source {slot}</span>
                <span className="mt-1 block text-sm">
                  {revealed
                    ? slot === wavSlot
                      ? wavLabel
                      : mp3Label
                    : "Hidden encode"}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="label-mono">Which one is uncompressed?</span>
            {(["A", "B"] as const).map((slot) => (
              <button
                key={slot}
                type="button"
                disabled={revealed}
                onClick={() => {
                  setGuess(slot);
                  setRevealed(true);
                }}
                className="label-mono min-h-9 border border-border px-3 transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none disabled:opacity-40"
              >
                {slot}
              </button>
            ))}
            <button
              type="button"
              onClick={startBlind}
              className="label-mono flex min-h-9 items-center gap-2 border border-border px-3 transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Reshuffle
            </button>
          </div>

          <p aria-live="polite" className="text-sm text-muted-foreground">
            {revealed
              ? guess === wavSlot
                ? `Correct — Source ${wavSlot} was the ${wavLabel} master.`
                : `Not this time — Source ${wavSlot} was the ${wavLabel} master.`
              : "Switch between sources while it plays, then commit to an answer."}
          </p>
        </div>
      )}

      <p className="mt-3 text-xs text-muted-foreground">
        Placeholder excerpts for demonstration. Use wired headphones or monitors — Bluetooth
        re-encodes both sources and erases the difference.
      </p>
    </div>
  );
}
