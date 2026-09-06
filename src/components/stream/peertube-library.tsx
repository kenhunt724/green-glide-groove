import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { streaming } from "@/content/streaming";

type PeertubeVideo = {
  uuid: string;
  name: string;
  duration: number;
  publishedAt: string;
  thumbnailPath?: string;
  embedPath?: string;
};

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function PeertubeLibrary() {
  const [videos, setVideos] = useState<PeertubeVideo[] | null>(null);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState<PeertubeVideo | null>(null);

  useEffect(() => {
    let active = true;
    fetch(streaming.peertubeApi, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ data: PeertubeVideo[] }>;
      })
      .then((json) => {
        if (active) setVideos(json.data ?? []);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <p className="text-sm text-muted-foreground">
        The on-demand library isn't answering yet. Once the video server on the workshop machine is
        online, everything published there appears here automatically.
      </p>
    );
  }

  if (!videos) {
    return <p className="text-sm text-muted-foreground">Loading the library…</p>;
  }

  if (videos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No recordings published yet. Upload one and it shows up here.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {playing ? (
        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            title={playing.name}
            src={`${streaming.peertube}${playing.embedPath ?? `/videos/embed/${playing.uuid}`}`}
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((video) => (
          <button
            key={video.uuid}
            type="button"
            onClick={() => setPlaying(video)}
            className="group text-left focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
          >
            <div className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted">
              {video.thumbnailPath ? (
                <img
                  src={`${streaming.peertube}${video.thumbnailPath}`}
                  alt={video.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : null}
              <PlayCircle className="absolute inset-0 m-auto h-10 w-10 text-foreground/80 opacity-0 transition-opacity group-hover:opacity-100" />
              <span className="label-mono absolute right-2 bottom-2 rounded bg-background/80 px-1.5 py-0.5">
                {formatDuration(video.duration)}
              </span>
            </div>
            <p className="mt-2 text-sm font-medium">{video.name}</p>
            <p className="label-mono text-muted-foreground">
              {new Date(video.publishedAt).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}
