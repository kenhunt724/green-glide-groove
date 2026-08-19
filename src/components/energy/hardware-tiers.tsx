import { useState } from "react";
import { Check, LayoutGrid, Table2 } from "lucide-react";
import { tiers } from "@/content/energy";

const specRows = [
  "Interface",
  "Placement",
  "Processing",
  "Local clock control",
  "Offline reliability",
] as const;

export function HardwareTiers() {
  const [view, setView] = useState<"cards" | "compare">("cards");

  return (
    <div>
      <div
        role="group"
        aria-label="Hardware view"
        className="flex w-fit border border-border bg-surface"
      >
        {(
          [
            { id: "cards", label: "Tiers", icon: LayoutGrid },
            { id: "compare", label: "Compare specs", icon: Table2 },
          ] as const
        ).map((o) => (
          <button
            key={o.id}
            type="button"
            aria-pressed={view === o.id}
            onClick={() => setView(o.id)}
            className={`label-mono inline-flex min-h-11 items-center gap-2 px-4 transition-colors focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none ${
              view === o.id ? "bg-energy text-background" : "hover:text-energy"
            }`}
          >
            <o.icon className="size-4" aria-hidden="true" />
            {o.label}
          </button>
        ))}
      </div>

      {view === "cards" ? (
        <div className="mt-8 grid gap-px bg-border lg:grid-cols-3">
          {tiers.map((t) => (
            <article key={t.id} className="flex flex-col bg-background p-7">
              <p className="label-mono text-energy">{t.tagline}</p>
              <h3 className="mt-3 font-display text-xl font-semibold">{t.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
              <ul className="mt-6 space-y-2">
                {specRows.map((k) => (
                  <li key={k} className="flex gap-2 text-sm">
                    <Check className="mt-[3px] size-4 shrink-0 text-energy" aria-hidden="true" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground">{k}:</span> {t.specs[k]}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-8 overflow-x-auto border border-border">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <caption className="sr-only">Hardware tier specification comparison</caption>
            <thead>
              <tr className="bg-surface">
                <th scope="col" className="label-mono border-b border-border p-4 text-left">
                  Specification
                </th>
                {tiers.map((t) => (
                  <th
                    key={t.id}
                    scope="col"
                    className="border-b border-l border-border p-4 text-left font-display text-base font-semibold"
                  >
                    {t.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specRows.map((k) => (
                <tr key={k}>
                  <th
                    scope="row"
                    className="label-mono border-b border-border p-4 text-left align-top"
                  >
                    {k}
                  </th>
                  {tiers.map((t) => (
                    <td
                      key={t.id}
                      className="border-b border-l border-border p-4 align-top text-muted-foreground"
                    >
                      {t.specs[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
