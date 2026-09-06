import { useEffect, useState } from "react";
import { Radio, WifiOff } from "lucide-react";
import { streaming } from "@/content/streaming";

type OwncastStatus = {
  online: boolean;
  viewerCount?: number;
  streamTitle?: string;
  lastConnectTime?: string | null;
};

export function OwncastPlayer() {
  const [status, setStatus] = useState<OwncastStatus | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch(streaming.statusApi, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const json = (await res.json()) as OwncastStatus;
        if (!active) return;
        setStatus(json);
        setFailed(false);
      } catch {
        if (active) setFailed(true);
      }
    };
    load();
    const timer = setInterval(load, 30_000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const live = !!status?.online;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
          <span
            className={`label-mono inline-flex items-center gap-2 ${
              live ? "text-energy" : "text-muted-foreground"
            }`}
          >
            {live ? <Radio className="h-4 w-4 animate-pulse" /> : <WifiOff className="h-4 w-4" />}
            {live ? "Live now" : failed ? "Stream endpoint unreachable" : "Offline"}
          </span>
          {live && typeof status?.viewerCount === "number" ? (
            <span className="label-mono text-muted-foreground">
              {status.viewerCount} watching
            </span>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-black">
          <iframe
            title="Earth Protection Society live stream"
            src={streaming.videoEmbed}
            allowFullScreen
            className="aspect-video w-full"
          />
        </div>

        {status?.streamTitle ? (
          <p className="mt-3 font-display text-lg font-semibold">{status.streamTitle}</p>
        ) : null}

        {!live ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nothing is broadcasting right now. The recorded library below is always available, and
            this player switches to the live feed automatically the moment a broadcast starts.
          </p>
        ) : null}
      </div>

      <div className="flex min-h-[420px] flex-col overflow-hidden rounded-lg border border-border">
        <div className="border-b border-border px-4 py-3">
          <span className="label-mono text-signal">Room chat</span>
        </div>
        <iframe
          title="Live stream chat"
          src={streaming.chatEmbed}
          className="h-full w-full flex-1 bg-background"
        />
      </div>
    </div>
  );
}
