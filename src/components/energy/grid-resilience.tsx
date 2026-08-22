import { Zap, Activity, ShieldCheck, Users } from "lucide-react";
import { gridResilience } from "@/content/energy";

const icons = [Zap, Activity, ShieldCheck, Users];

export function GridResilience() {
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
      <div>
        <p className="label-mono text-energy">{gridResilience.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold md:text-4xl">{gridResilience.headline}</h2>
        <p className="mt-5 text-muted-foreground leading-relaxed">{gridResilience.lede}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#book"
            className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90"
          >
            Plan a Resilience Site
          </a>
          <a
            href="#platforms"
            className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
          >
            View Platform Sizes
          </a>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        {gridResilience.points.map((p, i) => {
          const Icon = icons[i] ?? Zap;
          return (
            <article key={p.id} className="bg-background p-7">
              <Icon className="size-6 text-energy" aria-hidden="true" />
              <h3 className="mt-6 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
