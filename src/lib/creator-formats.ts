export type CreatorKind = "audio" | "video" | "art";

export const CREATOR_KINDS: { value: CreatorKind; label: string; blurb: string }[] = [
  {
    value: "audio",
    label: "Audio master",
    blurb: "Uncompressed WAV / AIFF / FLAC — 24-bit or better, any sample rate.",
  },
  {
    value: "video",
    label: "Video master",
    blurb: "ProRes / DNxHD / uncompressed MOV, MXF or AVI. Finished cut, no re-encode.",
  },
  {
    value: "art",
    label: "Art / photography",
    blurb: "TIFF, PNG or lossless-quality originals for print and cover use.",
  },
];

// Extensions accepted for the master (uncompressed / lossless) upload.
export const MASTER_EXTENSIONS: Record<CreatorKind, string[]> = {
  audio: ["wav", "aif", "aiff", "flac", "alac", "caf", "dsf"],
  video: ["mov", "mxf", "avi", "mkv", "prores", "dnx"],
  art: ["tif", "tiff", "png", "psd", "exr", "dng", "raw"],
};

// Small compressed stand-in used for public streaming/browsing.
export const PREVIEW_EXTENSIONS: Record<CreatorKind, string[]> = {
  audio: ["mp3", "m4a", "aac", "ogg", "opus"],
  video: ["mp4", "webm", "m4v"],
  art: ["jpg", "jpeg", "png", "webp"],
};

export const DEFAULT_MAX_MASTER_BYTES = 2 * 1024 * 1024 * 1024;

export function fileExtension(name: string): string {
  const parts = name.toLowerCase().split(".");
  return parts.length > 1 ? (parts.pop() as string) : "";
}

export function validateMasterFile(kind: CreatorKind, file: File, maxBytes: number) {
  const ext = fileExtension(file.name);
  if (!MASTER_EXTENSIONS[kind].includes(ext)) {
    return {
      ok: false as const,
      error: `Masters for ${kind} must be one of: ${MASTER_EXTENSIONS[kind].join(", ")}. Compressed files are not accepted here.`,
    };
  }
  if (file.size > maxBytes) {
    return {
      ok: false as const,
      error: `That file is ${formatBytes(file.size)} — the current limit is ${formatBytes(maxBytes)}.`,
    };
  }
  return { ok: true as const, error: null, ext };
}

export function validatePreviewFile(kind: CreatorKind, file: File) {
  const ext = fileExtension(file.name);
  if (!PREVIEW_EXTENSIONS[kind].includes(ext)) {
    return {
      ok: false as const,
      error: `Previews for ${kind} must be one of: ${PREVIEW_EXTENSIONS[kind].join(", ")}.`,
    };
  }
  return { ok: true as const, error: null, ext };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[i]}`;
}

export function normalizeHandle(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
