import { Container, Gauge, ShieldCheck, Wrench } from "lucide-react";
import { vaultAdvantages } from "@/content/energy";

const icons = [Gauge, Container, Wrench, ShieldCheck];

export function DetachedVault() {
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="surface-panel relative overflow-hidden p-8">
        <div
          aria-hidden="true"
          className="absolute -right-24 -bottom-24 size-72 rounded-full bg-energy/10 blur-3xl"
        />
        <p className="label-mono text-energy">Standard installation model</p>
        <h3 className="mt-4 font-display text-2xl font-semibold md:text-3xl">
          The Detached Power Vault
        </h3>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Every EPS stationary system ships as a dedicated exterior pod — a shed, utility enclosure
          or separate storage structure sited beside the building it serves. Batteries, inverters,
          cooling and the system controller all live there.
        </p>

        <dl className="mt-8 grid gap-px bg-border sm:grid-cols-2">
          {[
            ["Footprint", "6' × 8' pod typical"],
            ["Capacity", "15 – 120 kWh LiFePO4"],
            ["Thermal", "Isolated, actively vented"],
            ["Water", "Magnetic scale conditioning"],
          ].map(([k, v]) => (
            <div key={k} className="bg-surface p-4">
              <dt className="label-mono">{k}</dt>
              <dd className="mt-1 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        {vaultAdvantages.map((a, i) => {
          const Icon = icons[i] ?? ShieldCheck;
          return (
            <article key={a.id} className="bg-background p-6">
              <Icon className="size-6 text-emerald" aria-hidden="true" />
              <h4 className="mt-5 font-display text-lg font-semibold">{a.title}</h4>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a.body}</p>
            </article>
          );
        })}
      </div>
    </div>
  );
}
