import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { deepDive } from "@/content/deep-dive";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Society — Closed-Loop Metabolism & Local Work" },
      {
        name: "description",
        content:
          "Closed-loop urban metabolism, off-peak battery UPS load defection, LEED Platinum community building standards, and local technician job creation.",
      },
      { property: "og:title", content: "About Earth Protection Society" },
      {
        property: "og:description",
        content:
          "How the block recirculates materials, defects load from the grid, builds to LEED Platinum, and employs its own technicians.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">

      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-5 py-20">
          <p className="label-mono">Wing III · The Society</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-bold md:text-6xl">
            A single block, accounted for <span className="text-signal">end to end</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
            Earth Protection Society is not a brand laid over other people&apos;s supply chains. It
            is a charter: what the block consumes, the block accounts for — materials, electrons,
            buildings and work. Use the menu for the full systems index.
          </p>
        </div>
      </section>

      {deepDive.map((s, i) => (
        <section
          key={s.id}
          id={s.id}
          className={`scroll-mt-20 border-b border-border ${i % 2 === 1 ? "bg-surface" : ""}`}
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <div>
              <p className="label-mono">Brief {String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-3xl font-semibold">{s.title}</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                {s.summary}
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {s.points.map((p) => (
                  <li key={p} className="flex gap-3 border-t border-border pt-4 text-sm">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" />
                    <span className="leading-relaxed text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-panel flex flex-col justify-center p-8">
              <p className="font-display text-6xl font-bold text-signal">{s.metric.value}</p>
              <p className="mt-4 text-sm text-muted-foreground">{s.metric.label}</p>
            </div>
          </div>
        </section>
      ))}

      </main>
      <SiteFooter />
    </div>
  );
}
