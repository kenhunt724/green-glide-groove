import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Disc3, Factory, Leaf } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { deepDive } from "@/content/deep-dive";
import heroCampus from "@/assets/hero-campus.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Earth Protection Society — Sovereign Sound, Mobility & Metabolism" },
      {
        name: "description",
        content:
          "A community-owned umbrella: 432Hz uncompressed master streaming, community-built series-hybrid glider trucks, and a closed-loop urban metabolism.",
      },
      { property: "og:title", content: "Earth Protection Society" },
      {
        property: "og:description",
        content:
          "Ultra-streaming records, series-hybrid flex-fuel glider trucks, and a LEED Platinum closed-loop block.",
      },
    ],
  }),
  component: Index,
});

const wings = [
  {
    to: "/store" as const,
    icon: Disc3,
    kicker: "Wing I",
    title: "Ultra-Streaming Record Store",
    body: "Uncompressed 432Hz masters, waveform-first listening, and consignment shelves owned by the artists who cut them.",
  },
  {
    to: "/mobility" as const,
    icon: Factory,
    kicker: "Wing II",
    title: "Industrial Mobility",
    body: "Series-hybrid flex-fuel glider trucks on Brogen e-axles with LiFePO4 buffers, assembled by neighbourhood technicians.",
  },
  {
    to: "/about" as const,
    icon: Leaf,
    kicker: "Wing III",
    title: "The Society",
    body: "Closed-loop urban metabolism, off-peak load defection, LEED Platinum standards, and durable local employment.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">

      <section className="relative overflow-hidden border-b border-border">
        <img
          src={heroCampus}
          alt="Solar-canopied community workshop courtyard at dusk"
          width={1920}
          height={1088}
          className="absolute inset-0 size-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
        <div className="relative mx-auto max-w-7xl px-5 py-28 md:py-40">
          <p className="label-mono">Est. Block 12 / Sovereign Charter</p>
          <h1 className="mt-6 max-w-4xl text-5xl leading-[0.95] font-bold md:text-7xl">
            We keep the sound, the steel and the electrons
            <span className="text-signal"> inside the neighbourhood.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Earth Protection Society is a worker-and-artist umbrella running three wings out of one
            closed-loop block: an ultra-streaming record store, an industrial mobility shop, and the
            metabolic infrastructure that feeds both.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/store"
              className="inline-flex items-center gap-2 bg-signal px-6 py-3 font-display text-sm font-semibold text-signal-foreground transition-opacity hover:opacity-90"
            >
              Enter the record store <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/mobility"
              className="inline-flex items-center gap-2 border border-border bg-surface px-6 py-3 font-display text-sm font-semibold transition-colors hover:border-signal hover:text-signal"
            >
              See the glider trucks
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-px border-b border-border bg-border md:grid-cols-3">
        {wings.map((w) => (
          <Link
            key={w.to}
            to={w.to}
            className="group bg-background p-8 transition-colors hover:bg-surface"
          >
            <w.icon className="size-6 text-signal" />
            <p className="label-mono mt-6">{w.kicker}</p>
            <h2 className="mt-2 text-2xl font-semibold">{w.title}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{w.body}</p>
            <span className="label-mono mt-6 inline-flex items-center gap-1 text-signal opacity-0 transition-opacity group-hover:opacity-100">
              Open <ArrowUpRight className="size-3" />
            </span>
          </Link>
        ))}
      </section>

      <section className="rule-grid border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <p className="label-mono">Live ledger</p>
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {deepDive.map((s) => (
              <div key={s.id} className="surface-panel p-6">
                <p className="font-display text-4xl font-bold text-signal">{s.metric.value}</p>
                <p className="mt-3 text-sm text-muted-foreground">{s.metric.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </main>
      <SiteFooter />
    </div>
  );
}
