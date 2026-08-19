import { BatteryCharging, Car, EarOff, Sun, Wind } from "lucide-react";
import { mobileCharging, mobileUseCases } from "@/content/energy";

const icons = [BatteryCharging, Car, Sun];

export function MobileGenerators() {
  return (
    <div className="space-y-12">
      <div className="grid gap-px bg-border lg:grid-cols-3">
        {mobileCharging.map((c, i) => {
          const Icon = icons[i] ?? BatteryCharging;
          return (
            <article key={c.id} className="bg-background p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-emerald" aria-hidden="true" />
                <span className="font-display text-4xl font-bold text-border">{c.step}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{c.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          );
        })}
      </div>

      <div className="surface-panel flex flex-col gap-6 border border-emerald/40 p-7 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <Wind className="mt-1 size-6 shrink-0 text-emerald" aria-hidden="true" />
          <div>
            <p className="font-display text-lg font-semibold text-emerald">
              Zero deadly fumes. Pure silence.
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              No combustion means no carbon monoxide, so the unit runs safely indoors, inside
              enclosed trailers, and in basements. Zero exhaust, zero engine noise — legal to run
              through night-time noise curfews and quiet-hours ordinances.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 border border-border bg-background px-5 py-4">
          <EarOff className="size-5 text-emerald" aria-hidden="true" />
          <span className="label-mono">0 dB engine · 0 ppm CO</span>
        </div>
      </div>

      <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {mobileUseCases.map((u) => (
          <li key={u} className="bg-background p-5 text-sm font-medium">
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
}
