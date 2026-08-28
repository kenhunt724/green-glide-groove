import { Droplets, FlaskConical, Gauge } from "lucide-react";
import { hydrogen } from "@/content/energy";

const icons = [Gauge, FlaskConical, Droplets];

export function HydrogenStation() {
  return (
    <div className="space-y-12">
      <div className="grid gap-px bg-border sm:grid-cols-3">
        {hydrogen.economics.map((e) => (
          <div key={e.id} className="bg-background p-7">
            <p className="label-mono text-emerald">{e.label}</p>
            <p className="mt-3 font-display text-3xl font-bold text-energy">{e.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{e.note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-px bg-border lg:grid-cols-3">
        {hydrogen.stack.map((s, i) => {
          const Icon = icons[i] ?? FlaskConical;
          return (
            <article key={s.id} className="bg-background p-7">
              <div className="flex items-center justify-between">
                <Icon className="size-6 text-energy" aria-hidden="true" />
                <span className="font-display text-4xl font-bold text-border">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </article>
          );
        })}
      </div>

      <div>
        <p className="label-mono text-emerald">Where it fits today</p>
        <ul className="mt-4 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
          {hydrogen.applications.map((a) => (
            <li key={a} className="bg-background p-5 text-sm font-medium">
              {a}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
