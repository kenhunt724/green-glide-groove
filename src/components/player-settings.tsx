import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Settings2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BufferMode = "minimal" | "balanced" | "eager";

export const bufferAhead: Record<BufferMode, number> = {
  minimal: 0.04,
  balanced: 0.12,
  eager: 0.3,
};

export interface PlayerSettings {
  volume: number;
  zoom: number;
  buffer: BufferMode;
  setVolume: (v: number) => void;
  setZoom: (v: number) => void;
  setBuffer: (v: BufferMode) => void;
}

const PlayerSettingsContext = createContext<PlayerSettings | null>(null);

export function PlayerSettingsProvider({ children }: { children: ReactNode }) {
  const [volume, setVolume] = useState(0.8);
  const [zoom, setZoom] = useState(1);
  const [buffer, setBuffer] = useState<BufferMode>("balanced");

  const value = useMemo(
    () => ({ volume, zoom, buffer, setVolume, setZoom, setBuffer }),
    [volume, zoom, buffer],
  );

  return (
    <PlayerSettingsContext.Provider value={value}>{children}</PlayerSettingsContext.Provider>
  );
}

export function usePlayerSettings(): PlayerSettings {
  const ctx = useContext(PlayerSettingsContext);
  if (!ctx) throw new Error("usePlayerSettings must be used inside PlayerSettingsProvider");
  return ctx;
}

export function PlayerSettingsPanel() {
  const { volume, zoom, buffer, setVolume, setZoom, setBuffer } = usePlayerSettings();

  return (
    <Popover>
      <PopoverTrigger
        aria-label="Audio player settings"
        className="label-mono flex min-h-11 items-center gap-2 border border-border bg-surface px-3 text-foreground transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
      >
        <Settings2 className="size-4" aria-hidden="true" />
        Player settings
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-6 border-border bg-background p-5">
        <div className="space-y-2">
          <Label htmlFor="buffer-mode" className="label-mono">
            Buffering behaviour
          </Label>
          <Select value={buffer} onValueChange={(v) => setBuffer(v as BufferMode)}>
            <SelectTrigger id="buffer-mode">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minimal">Minimal — lowest data use</SelectItem>
              <SelectItem value="balanced">Balanced — default</SelectItem>
              <SelectItem value="eager">Eager — pre-buffer uncompressed</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Sets how far ahead masters are cached before playback.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="volume" className="label-mono">
              Volume
            </Label>
            <span className="label-mono tabular-nums">{Math.round(volume * 100)}%</span>
          </div>
          <Slider
            id="volume"
            aria-label="Volume"
            value={[volume * 100]}
            min={0}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume((v ?? 0) / 100)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="zoom" className="label-mono">
              Waveform zoom
            </Label>
            <span className="label-mono tabular-nums">{zoom.toFixed(1)}×</span>
          </div>
          <Slider
            id="zoom"
            aria-label="Waveform zoom"
            value={[zoom * 10]}
            min={10}
            max={60}
            step={5}
            onValueChange={([v]) => setZoom((v ?? 10) / 10)}
          />
          <p className="text-xs text-muted-foreground">
            Zoomed views follow the playhead for fine scrubbing.
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
