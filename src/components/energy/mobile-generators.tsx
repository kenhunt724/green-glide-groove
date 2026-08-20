import { BatteryCharging, Car, EarOff, Sun, Wind } from "lucide-react";
import { mobileCharging, mobileUseCases } from "@/content/energy";
import generatorPhoto from "@/assets/generator-photo.jpg";
import generatorVideo from "@/assets/generator-animated.mp4.asset.json";

const icons = [BatteryCharging, Car, Sun];

export function MobileGenerators() {
  return (
    <div className="space-y-12">
      <figure className="grid items-stretch gap-px bg-border lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <video
          src={generatorVideo.url}
          poster={generatorPhoto}
          autoPlay
          muted
          loop
          playsInline
          aria-label="The community-built LiFePO4 generator cart: steel diamond-plate frame, pure sine inverter panel and 12.8V LiFePO4 battery"
          className="h-full w-full object-cover"
        />

        <figcaption className="flex flex-col justify-center bg-background p-7">
          <p className="label-mono text-emerald">Same footprint, no engine</p>
          <h3 className="mt-3 font-display text-2xl font-semibold">
            Built on gas-generator hardware
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            We reuse the exact chassis language crews already trust — tubular roll cage, never-flat
            wheels, fold-down tow handle, and a standard 120V/30A outlet panel. Everything behind
            the panel is LiFePO4 and pure sine inverter instead of a combustion engine, so it drops
            straight into the same jobsite workflow with none of the fumes, fuel cans, or pull-cord
            starts.
          </p>
        </figcaption>
      </figure>

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
