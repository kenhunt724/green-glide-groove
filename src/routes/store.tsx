import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactPhone } from "@/components/contact-phone";
import { WaveformPlayer } from "@/components/waveform-player";
import { FormatABPlayer } from "@/components/format-ab-player";
import { audioSamples } from "@/content/audio-samples";
import { PlayerSettingsPanel, PlayerSettingsProvider } from "@/components/player-settings";
import cover1 from "@/assets/cover-1.jpg";
import cover2 from "@/assets/cover-2.jpg";
import cover3 from "@/assets/cover-3.jpg";
import cover4 from "@/assets/cover-4.jpg";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "Ultra-Streaming Record Store — Earth Protection Society" },
      {
        name: "description",
        content:
          "A dark-mode boutique record store streaming uncompressed 432Hz masters with waveform players, plus artist-owned consignment shelves.",
      },
      { property: "og:title", content: "Ultra-Streaming Record Store" },
      {
        property: "og:description",
        content: "Uncompressed 432Hz masters, waveform listening, artist consignment shelves.",
      },
    ],
  }),
  component: StorePage,
});

const releases = [
  {
    title: "Resonant Ground",
    artist: "Halva Ostrander",
    cover: cover1,
    format: "24-bit / 192 kHz WAV",
    duration: 254,
    seed: 3,
    price: "$18",
    tags: ["432Hz master", "Analogue tape"],
  },
  {
    title: "Moss Telemetry",
    artist: "Field Union",
    cover: cover2,
    format: "32-bit float / 96 kHz",
    duration: 331,
    seed: 11,
    price: "$22",
    tags: ["432Hz master", "Live to two-track"],
  },
  {
    title: "Off-Peak Hymns",
    artist: "Nightshift Choir",
    cover: cover3,
    format: "24-bit / 96 kHz FLAC",
    duration: 287,
    seed: 19,
    price: "$16",
    tags: ["432Hz master", "Room mics only"],
  },
  {
    title: "Slate Water",
    artist: "Corvid Signal",
    cover: cover4,
    format: "DSD64 / 2.8 MHz",
    duration: 402,
    seed: 27,
    price: "$26",
    tags: ["432Hz master", "Direct-to-disc"],
  },
];

const shelves = [
  {
    name: "Shelf A — Ridgeline Tapes",
    keeper: "Ola Márquez",
    stock: 42,
    split: "85 / 15 to the artist",
    note: "Hand-dubbed cassettes and lathe-cut 7-inches from the north workshops.",
  },
  {
    name: "Shelf B — Sub-Basement Press",
    keeper: "T. Weller",
    stock: 18,
    split: "90 / 10 to the artist",
    note: "Short-run 180g pressings mastered in the campus room at 432Hz.",
  },
  {
    name: "Shelf C — Apprentice Wall",
    keeper: "Rotating",
    stock: 63,
    split: "100 / 0 to the artist",
    note: "First releases by technicians and apprentices. No fee, no cut, no contract.",
  },
];

const playlists = [
  {
    id: "all",
    name: "Full catalog",
    blurb: "Every master currently served bit-perfect.",
    titles: releases.map((r) => r.title),
  },
  {
    id: "night-shift",
    name: "Night Shift",
    blurb: "Off-peak listening for the battery hours.",
    titles: ["Off-Peak Hymns", "Slate Water"],
  },
  {
    id: "room-tone",
    name: "Room Tone",
    blurb: "Live-to-two-track and room-mic captures.",
    titles: ["Moss Telemetry", "Off-Peak Hymns"],
  },
  {
    id: "high-rate",
    name: "High Rate",
    blurb: "192 kHz and DSD transfers for full-range rigs.",
    titles: ["Resonant Ground", "Slate Water"],
  },
];

function StorePage() {
  const [query, setQuery] = useState("");
  const [playlistId, setPlaylistId] = useState("all");

  const activePlaylist = playlists.find((p) => p.id === playlistId) ?? playlists[0]!;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return releases
      .filter((r) => activePlaylist.titles.includes(r.title))
      .filter((r) =>
        q
          ? [r.title, r.artist, r.format, ...r.tags].some((f) => f.toLowerCase().includes(q))
          : true,
      );
  }, [query, activePlaylist]);

  return (
    <PlayerSettingsProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main id="main">
          <section className="border-b border-border">
            <div className="mx-auto max-w-7xl px-5 py-20">
              <p className="label-mono">Wing I · Ultra-Streaming</p>
              <h1 className="mt-5 max-w-3xl text-4xl font-bold md:text-6xl">
                Uncompressed masters, tuned to <span className="text-signal">432Hz</span>, streamed
                without a codec in the way.
              </h1>
              <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
                Every title here is served as the mastering engineer left it. Scrub the waveform,
                hear the room, and buy the file or the physical copy from the shelf that keeps it.
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-5 py-16">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="text-2xl font-semibold">Now streaming</h2>
              <p className="label-mono">Bit-perfect · No transcode</p>
            </div>

            <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <search className="relative w-full lg:max-w-md">
                <label htmlFor="catalog-search" className="sr-only">
                  Search the catalog by title, artist, tag or format
                </label>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="catalog-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search titles, artists, formats…"
                  className="h-11 pr-10 pl-9"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
                  >
                    <X className="size-4" aria-hidden="true" />
                  </button>
                )}
              </search>
              <PlayerSettingsPanel />
            </div>

            <div className="mt-6">
              <h3 className="label-mono">Curated playlists</h3>
              <div
                role="group"
                aria-label="Curated playlists"
                className="mt-3 flex flex-wrap gap-2"
              >
                {playlists.map((p) => {
                  const active = p.id === activePlaylist.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setPlaylistId(p.id)}
                      className={`label-mono min-h-11 border px-4 transition-colors focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none ${
                        active
                          ? "border-signal bg-signal/10 text-signal"
                          : "border-border bg-surface text-muted-foreground hover:border-signal hover:text-signal"
                      }`}
                    >
                      {p.name}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{activePlaylist.blurb}</p>
            </div>

            <p aria-live="polite" className="label-mono mt-6">
              {filtered.length} {filtered.length === 1 ? "master" : "masters"} in{" "}
              {activePlaylist.name}
              {query ? ` matching “${query}”` : ""}
            </p>

            {filtered.length === 0 && (
              <p className="mt-6 border border-border bg-surface p-6 text-muted-foreground">
                No masters match that search in this playlist. Try the full catalog.
              </p>
            )}

            <div className="mt-8 flex flex-col gap-px bg-border empty:hidden">
              {filtered.map((r) => (
                <article
                  key={r.title}
                  className="grid gap-6 bg-background p-6 transition-colors hover:bg-surface md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center"
                >
                  <img
                    src={r.cover}
                    alt={`${r.title} cover art`}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="size-28 object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-baseline gap-x-3">
                      <h3 className="text-xl font-semibold">{r.title}</h3>
                      <span className="label-mono">{r.artist}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {r.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="label-mono border-signal/40 text-signal"
                        >
                          {t}
                        </Badge>
                      ))}
                      <Badge variant="outline" className="label-mono">
                        {r.format}
                      </Badge>
                    </div>
                    <div className="mt-4">
                      <WaveformPlayer
                        seed={r.seed}
                        duration={r.duration}
                        label={`${r.title} by ${r.artist}`}
                      />
                    </div>
                    {audioSamples[r.title] && (
                      <div className="mt-4">
                        <FormatABPlayer sample={audioSamples[r.title]!} label={r.title} />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3 md:flex-col md:items-end">
                    <span className="font-display text-2xl font-bold">{r.price}</span>
                    <button className="border border-signal/50 bg-signal/10 px-4 py-2 font-display text-xs font-semibold tracking-wide text-signal uppercase transition-colors hover:bg-signal/20">
                      Add to crate
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="border-t border-border bg-surface">
            <div className="mx-auto max-w-7xl px-5 py-16">
              <h2 className="text-2xl font-semibold">Artist consignment shelves</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Physical stock stays the property of the artist until it sells. The Society takes
                the floor space, the counter, and nothing else it hasn&apos;t earned.
              </p>
              <div className="mt-10 grid gap-px bg-border md:grid-cols-3">
                {shelves.map((s) => (
                  <div key={s.name} className="bg-surface p-6">
                    <h3 className="font-display text-lg font-semibold">{s.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.note}</p>
                    <dl className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between border-t border-border pt-2">
                        <dt className="label-mono">Keeper</dt>
                        <dd>{s.keeper}</dd>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <dt className="label-mono">In stock</dt>
                        <dd>{s.stock} units</dd>
                      </div>
                      <div className="flex justify-between border-t border-border pt-2">
                        <dt className="label-mono">Split</dt>
                        <dd className="text-signal">{s.split}</dd>
                      </div>
                    </dl>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="border-t border-border">
            <div className="mx-auto max-w-7xl px-5 py-16">
              <h2 className="text-2xl font-semibold">Questions about a release?</h2>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                The Society runs this counter directly. Call or text for consignment, masters, or
                press orders.
              </p>
              <div className="mt-8">
                <ContactPhone variant="signal" />
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
      </div>
    </PlayerSettingsProvider>
  );
}
