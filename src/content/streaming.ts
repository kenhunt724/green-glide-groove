// Where the Omen box lives. Override with VITE_OWNCAST_URL / VITE_PEERTUBE_URL
// in .env (or the project environment) once the Cloudflare tunnel is running.
const env = import.meta.env as Record<string, string | undefined>;

function clean(url: string | undefined, fallback: string) {
  return (url && url.trim() ? url.trim() : fallback).replace(/\/+$/, "");
}

export const OWNCAST_URL = clean(env["VITE_OWNCAST_URL"], "https://live.earthresonancehub.com");
export const PEERTUBE_URL = clean(env["VITE_PEERTUBE_URL"], "https://video.earthresonancehub.com");

export const streaming = {
  owncast: OWNCAST_URL,
  peertube: PEERTUBE_URL,
  videoEmbed: `${OWNCAST_URL}/embed/video`,
  chatEmbed: `${OWNCAST_URL}/embed/chat/readonly`,
  statusApi: `${OWNCAST_URL}/api/status`,
  peertubeApi: `${PEERTUBE_URL}/api/v1/videos?count=12&sort=-publishedAt&nsfw=false`,
  /** Contractual availability target published on the status page. */
  slaTarget: 99.5,
} as const;
