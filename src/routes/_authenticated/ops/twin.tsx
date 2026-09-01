import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertTriangle, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { getTwinSnapshot, saveUnitDuty } from "@/lib/twin.functions";
import { kindLabel, type UnitAssessment } from "@/lib/twin";

export const Route = createFileRoute("/_authenticated/ops/twin")({
  component: TwinConsole,
  head: () => ({
    meta: [
      { title: "Digital Twin | Earth Protection Society Operations" },
      {
        name: "description",
        content:
          "Live health view of every delivered Earth Protection Society unit: state of health, wear on modules, inverter and contactors, and the parts to replace before they fail.",
      },
      { property: "og:title", content: "Digital Twin | Earth Protection Society" },
      {
        property: "og:description",
        content: "Per-unit health, wear tracking and predictive parts replacement for the EPS fleet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const bandClass: Record<UnitAssessment["band"], string> = {
  healthy: "text-energy",
  watch: "text-amber-400",
  service: "text-destructive",
};

const bandLabel: Record<UnitAssessment["band"], string> = {
  healthy: "Healthy",
  watch: "Watch",
  service: "Service now",
};

function TwinConsole() {
  const snapshotFn = useServerFn(getTwinSnapshot);
  const saveFn = useServerFn(saveUnitDuty);
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["twin-snapshot"],
    queryFn: () => snapshotFn(),
    retry: false,
  });

  const save = useMutation({
    mutationFn: (payload: {
      id: string;
      cycles_per_week: number;
      duty_factor: number;
      service_contract: boolean;
    }) => saveFn({ data: payload }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["twin-snapshot"] }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-energy" aria-label="Loading fleet data" />
      </div>
    );
  }

  if (error) {
    return (
      <main id="main" className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-display text-3xl font-semibold">No operations access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in but has not been granted the operations role yet.
        </p>
        <Link to="/energy" className="label-mono mt-6 inline-block text-energy">
          Back to the energy site
        </Link>
      </main>
    );
  }

  if (!data) return null;
  const { rollup, assessments, queue } = data;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="label-mono text-energy">Operations / digital twin</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Every unit, while it runs</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          A live software copy of each cart, pod, trailer and container plant. It tracks wear on the
          parts that actually fail — modules, power stage, fans, contactors, balance leads — and
          tells you what to replace before the customer ever loses power. Units without real
          telemetry yet are modelled from their declared duty, and switch to live data the moment a
          reading arrives.
        </p>
        <div className="mt-4 flex flex-wrap gap-4">
          <Link to="/ops/capacity" className="label-mono text-energy">
            Capacity console →
          </Link>
          <Link to="/ops/marketing" className="label-mono text-energy">
            Channel console →
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Fleet summary">
        {[
          ["Units in the field", String(rollup.units)],
          ["Average health", `${rollup.avgHealth}%`],
          ["Parts due in 90 days", String(rollup.partsDue90)],
          ["Under service contract", `${rollup.underContract}/${rollup.units}`],
        ].map(([label, value]) => (
          <div key={label} className="surface-panel p-5">
            <p className="label-mono">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {rollup.simulated > 0 && (
        <p className="mt-4 flex items-start gap-2 text-xs text-muted-foreground">
          <Activity className="mt-0.5 size-4 shrink-0 text-energy" aria-hidden="true" />
          {rollup.simulated} of {rollup.units} units are running on modelled telemetry. Once a unit
          reports real readings, its twin uses those instead — no code change needed.
        </p>
      )}

      {/* Replacement queue */}
      <section className="mt-12" aria-labelledby="queue">
        <h2 id="queue" className="font-display text-2xl font-semibold">
          01 — Replace before it wears out
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The next part to fail on each unit, soonest first. This is the service-contract work
          order.
        </p>
        <div className="surface-panel mt-6 overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead>
              <tr className="label-mono border-b border-border text-left">
                <th className="p-4">Unit</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Part</th>
                <th className="p-4">Due in</th>
                <th className="p-4">Covered</th>
              </tr>
            </thead>
            <tbody>
              {queue.map((q) => (
                <tr key={q.unitCode} className="border-b border-border/50 last:border-0">
                  <td className="p-4 font-mono text-xs">{q.unitCode}</td>
                  <td className="p-4">{q.customer}</td>
                  <td className="p-4">
                    {q.part}
                    <span className="block text-xs text-muted-foreground">{q.action}</span>
                  </td>
                  <td className={`p-4 ${q.inDays < 90 ? "text-destructive" : ""}`}>
                    {q.inDays} days
                  </td>
                  <td className="p-4">
                    {q.covered ? (
                      "Service contract"
                    ) : (
                      <span className="text-amber-400">Quote separately</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Per-unit twins */}
      <section className="mt-12" aria-labelledby="units">
        <h2 id="units" className="font-display text-2xl font-semibold">
          02 — Unit health
        </h2>
        <div className="mt-6 space-y-4">
          {assessments.map((a) => {
            const open = openId === a.unit.id;
            return (
              <article key={a.unit.id} className="surface-panel p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="label-mono text-energy">{a.unit.unit_code}</p>
                    <h3 className="mt-1 font-display text-xl font-semibold">
                      {a.unit.customer_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {kindLabel(a.unit.unit_kind)} · {a.unit.pack_kwh} kWh ·{" "}
                      {a.unit.module_count} modules · {a.unit.site_label ?? "Site not set"} ·{" "}
                      {Math.round(a.ageDays / 30)} months in service
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-display text-3xl font-semibold ${bandClass[a.band]}`}>
                      {a.healthScore}
                    </p>
                    <p className="label-mono">{bandLabel[a.band]}</p>
                  </div>
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                  {[
                    ["State of health", `${a.telemetry.state_of_health}%`],
                    ["Cycles", a.telemetry.cycle_count.toLocaleString()],
                    ["Hottest cell", `${a.telemetry.max_cell_temp_c} °C`],
                    ["Cell spread", `${a.telemetry.cell_delta_mv} mV`],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="label-mono">{k}</dt>
                      <dd className="mt-1 font-display text-lg">{v}</dd>
                    </div>
                  ))}
                </dl>

                {a.alerts.length > 0 && (
                  <ul className="mt-5 space-y-2 text-sm">
                    {a.alerts.map((alert) => (
                      <li key={alert} className="flex gap-2">
                        <AlertTriangle
                          className="mt-0.5 size-4 shrink-0 text-amber-400"
                          aria-hidden="true"
                        />
                        <span>{alert}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  className="label-mono mt-5 text-energy"
                  onClick={() => setOpenId(open ? null : a.unit.id)}
                >
                  {open ? "Hide wear detail" : "Wear detail & duty settings"}
                </button>

                {open && <UnitDetail assessment={a} onSave={save.mutate} saving={save.isPending} />}
              </article>
            );
          })}
        </div>
      </section>

      <p className="mt-12 text-xs text-muted-foreground">
        Wear models here are engineering estimates from cycle and runtime counts. Once enough units
        report real failures, the same table becomes training data for a predictive model on the
        workshop machine — the site only evaluates the result.
      </p>
    </main>
  );
}

function UnitDetail({
  assessment,
  onSave,
  saving,
}: {
  assessment: UnitAssessment;
  onSave: (p: {
    id: string;
    cycles_per_week: number;
    duty_factor: number;
    service_contract: boolean;
  }) => void;
  saving: boolean;
}) {
  const { unit, components } = assessment;
  const [cycles, setCycles] = useState(unit.cycles_per_week);
  const [duty, setDuty] = useState(unit.duty_factor);
  const [covered, setCovered] = useState(unit.service_contract);

  return (
    <div className="mt-6 border-t border-border pt-6">
      <ul className="space-y-3">
        {components.map((c) => (
          <li key={c.name}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span>{c.name}</span>
              <span className="text-muted-foreground">
                {c.wearPct}% used · ~{c.remainingDays} days left
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
              <div
                className={`h-1.5 rounded-full ${c.wearPct > 80 ? "bg-destructive" : "bg-energy"}`}
                style={{ width: `${Math.max(2, c.wearPct)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <p className="label-mono">Cycles per week: {cycles}</p>
          <Slider
            className="mt-3"
            value={[cycles]}
            min={0}
            max={21}
            step={1}
            onValueChange={([v]) => setCycles(v ?? 0)}
          />
        </div>
        <div>
          <p className="label-mono">Duty factor: {duty.toFixed(2)}×</p>
          <Slider
            className="mt-3"
            value={[duty]}
            min={0.2}
            max={2}
            step={0.05}
            onValueChange={([v]) => setDuty(v ?? 1)}
          />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-3 text-sm">
          <Switch checked={covered} onCheckedChange={setCovered} />
          Service contract active
        </label>
        <button
          type="button"
          className="label-mono rounded-md border border-border px-3 py-2 text-xs hover:border-energy disabled:opacity-50"
          disabled={saving}
          onClick={() =>
            onSave({
              id: unit.id,
              cycles_per_week: cycles,
              duty_factor: duty,
              service_contract: covered,
            })
          }
        >
          {saving ? "Saving…" : "Save duty settings"}
        </button>
      </div>
    </div>
  );
}
