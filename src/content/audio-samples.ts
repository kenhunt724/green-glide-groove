import mossMp3 from "@/assets/audio/moss-telemetry.mp3.asset.json";
import mossWav from "@/assets/audio/moss-telemetry.wav.asset.json";
import hymnsMp3 from "@/assets/audio/off-peak-hymns.mp3.asset.json";
import hymnsWav from "@/assets/audio/off-peak-hymns.wav.asset.json";
import groundMp3 from "@/assets/audio/resonant-ground.mp3.asset.json";
import groundWav from "@/assets/audio/resonant-ground.wav.asset.json";
import slateMp3 from "@/assets/audio/slate-water.mp3.asset.json";
import slateWav from "@/assets/audio/slate-water.wav.asset.json";

export interface AudioSample {
  /** Lossy reference encode. */
  mp3: string;
  /** Uncompressed 48 kHz / 16-bit PCM master excerpt. */
  wav: string;
  mp3Label: string;
  wavLabel: string;
}

/**
 * Placeholder listening excerpts. Swap the .asset.json pointers for real
 * mastered clips when the label supplies them — the shape stays the same.
 */
export const audioSamples: Record<string, AudioSample> = {
  "Resonant Ground": {
    mp3: groundMp3.url,
    wav: groundWav.url,
    mp3Label: "MP3 48 kbps / 32 kHz",
    wavLabel: "WAV 16-bit / 48 kHz",
  },
  "Moss Telemetry": {
    mp3: mossMp3.url,
    wav: mossWav.url,
    mp3Label: "MP3 48 kbps / 32 kHz",
    wavLabel: "WAV 16-bit / 48 kHz",
  },
  "Off-Peak Hymns": {
    mp3: hymnsMp3.url,
    wav: hymnsWav.url,
    mp3Label: "MP3 48 kbps / 32 kHz",
    wavLabel: "WAV 16-bit / 48 kHz",
  },
  "Slate Water": {
    mp3: slateMp3.url,
    wav: slateWav.url,
    mp3Label: "MP3 48 kbps / 32 kHz",
    wavLabel: "WAV 16-bit / 48 kHz",
  },
};
