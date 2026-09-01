import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Download, Loader2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  getOpsSnapshot,
  saveCapacitySettings,
  saveJobProfile,
  setLeadOutcome,
  exportTrainingCsv,
} from "@/lib/capacity.functions";
import { buildWeeklyLoad, forecastThroughput, type CapacitySettings } from "@/lib/capacity";
import { scoreBand } from "@/lib/lead-model";

export const Route = createFileRoute("/_authenticated/ops/capacity")({
  component: CapacityConsole,
  head: () => ({
    meta: [
      { title: "Capacity Console | Earth Protection Society Operations" },
      {
        name: "description",
        content:
          "Internal capacity planner: weekly delivery load, bottlenecks, lead readiness scoring, and throughput forecasting for EPS installs and mobile generator builds.",
      },
      { property: "og:title", content: "Capacity Console | Earth Protection Society" },
      {
        property: "og:description",
        content: "Internal capacity planner for EPS installs and mobile generator builds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const pct = (n: number) => `${Math.round(Math.min(n, 3) * 100)}%`;

function CapacityConsole() {
  const snapshotFn = useServerFn(getOpsSnapshot);
  const saveSettingsFn = useServerFn(saveCapacitySettings);
  const saveProfileFn = useServerFn(saveJobProfile);
  const outcomeFn = useServerFn(setLeadOutcome);
  const exportFn = useServerFn(exportTrainingCsv);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ops-snapshot"],
    queryFn: () => snapshotFn(),
    retry: false,
  });

  const [draft, setDraft] = useState<CapacitySettings | null>(null);
  const [extraTechs, setExtraTechs] = useState(0);
  const [extraBays, setExtraBays] = useState(0);

  useEffect(() => {
    if (data?.settings && !draft) setDraft(data.settings);
  }, [data, draft]);

  const settingsMutation = useMutation({
    mutationFn: (s: CapacitySettings) => saveSettingsFn({ data: s }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-snapshot"] }),
  });

  const profileMutation = useMutation({
    mutationFn: (p: {
      id: string;
      technician_days: number;
      build_hours: number;
      parts_lead_time_days: number;
    }) => saveProfileFn({ data: p }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-snapshot"] }),
  });

  const outcomeMutation = useMutation({
    mutationFn: (v: { id: string; outcome: "pending" | "won" | "lost" }) => outcomeFn({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ops-snapshot"] }),
  });

  const active = draft ?? data?.settings ?? null;

  const weeks = useMemo(() => {
    if (!data || !active) return [];
    return buildWeeklyLoad(data.jobs, data.profiles, active);
  }, [data, active]);

  const baseline = useMemo(
    () => (data && active ? forecastThroughput(active, data.profiles) : null),
    [data, active],
  );
  const whatIf = useMemo(
    () => (data && active ? forecastThroughput(active, data.profiles, extraTechs, extraBays) : null),
    [data, active, extraTechs, extraBays],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-energy" aria-label="Loading capacity data" />
      </div>
    );
  }

  if (error) {
    return (
      <main id="main" className="mx-auto max-w-2xl px-6 py-24">
        <h1 className="font-display text-3xl font-semibold">No operations access</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This account is signed in but has not been granted the operations role yet. Ask an
          existing admin to add it, then reload this page.
        </p>
        <Link to="/energy" className="label-mono mt-6 inline-block text-energy">
          Back to the energy site
        </Link>
      </main>
    );
  }

  if (!data || !active) return null;

  const labelledTotal = data.labelled.won + data.labelled.lost;
  const readyToTrain = labelledTotal >= 150;

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono text-energy">Operations / capacity engine</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">
            What we can actually build & install
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Product and service are the currency. This is the weekly ledger of delivery capacity,
            the demand pressing against it, and the constraint that decides how fast you scale.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Link to="/ops/marketing" className="label-mono inline-block text-energy">
              Go to the channel console →
            </Link>
            <Link to="/ops/twin" className="label-mono inline-block text-energy">
              Go to the digital twin →
            </Link>
          </div>

        </div>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="label-mono inline-flex min-h-11 items-center gap-2 border border-border px-4 hover:border-energy hover:text-energy"
        >
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </button>
      </header>

      {/* Capacity ledger */}
      <section className="mt-12" aria-labelledby="ledger">
        <h2 id="ledger" className="font-display text-2xl font-semibold">
          01 — Capacity ledger
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your real weekly delivery capacity. Edit these to match the crew you have this month.
        </p>

        <form
          className="surface-panel mt-6 grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            settingsMutation.mutate(active);
          }}
        >
          {(
            [
              ["technician_days_per_week", "Technician-days / week"],
              ["vault_installs_per_week", "Vault installs / week"],
              ["generator_builds_per_week", "Generator builds / week"],
              ["service_visits_per_week", "Maintenance visits / week"],
              ["technician_count", "Technicians on the crew"],
              ["build_bays", "Build bays"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`cap-${key}`}>{label}</Label>
              <Input
                id={`cap-${key}`}
                type="number"
                min={0}
                step={key === "technician_count" || key === "build_bays" ? 1 : 0.5}
                value={active[key]}
                onChange={(e) =>
                  setDraft({ ...active, [key]: Number(e.target.value) || 0 } as CapacitySettings)
                }
              />
            </div>
          ))}
          <div className="flex items-end gap-3 sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              disabled={settingsMutation.isPending}
              className="label-mono inline-flex min-h-11 items-center gap-2 bg-energy px-6 font-semibold text-background hover:opacity-90 disabled:opacity-40"
            >
              {settingsMutation.isPending && <Loader2 className="size-4 animate-spin" />}
              Save capacity
            </button>
            {settingsMutation.isSuccess && (
              <span className="label-mono text-emerald">Saved</span>
            )}
          </div>
        </form>
      </section>

      {/* Job profiles */}
      <section className="mt-14" aria-labelledby="profiles">
        <h2 id="profiles" className="font-display text-2xl font-semibold">
          02 — Job profiles
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          What each solution actually costs you in crew time and parts lead time.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {data.profiles.map((p) => (
            <form
              key={p.id}
              className="surface-panel space-y-4 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                profileMutation.mutate({
                  id: p.id,
                  technician_days: Number(fd.get("technician_days")),
                  build_hours: Number(fd.get("build_hours")),
                  parts_lead_time_days: Number(fd.get("parts_lead_time_days")),
                });
              }}
            >
              <h3 className="font-display text-lg font-semibold">{p.solution_interest}</h3>
              <div className="space-y-2">
                <Label htmlFor={`td-${p.id}`}>Technician-days</Label>
                <Input
                  id={`td-${p.id}`}
                  name="technician_days"
                  type="number"
                  min={0}
                  step={0.5}
                  defaultValue={p.technician_days}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`bh-${p.id}`}>Build hours</Label>
                <Input
                  id={`bh-${p.id}`}
                  name="build_hours"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={p.build_hours}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`pl-${p.id}`}>Parts lead time (days)</Label>
                <Input
                  id={`pl-${p.id}`}
                  name="parts_lead_time_days"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={p.parts_lead_time_days}
                />
              </div>
              <button
                type="submit"
                className="label-mono min-h-11 w-full border border-border hover:border-energy hover:text-energy"
              >
                Save profile
              </button>
            </form>
          ))}
        </div>
      </section>

      {/* Weekly load */}
      <section className="mt-14" aria-labelledby="load">
        <h2 id="load" className="font-display text-2xl font-semibold">
          03 — 12-week load vs. capacity
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Booked demand, weighted by readiness and shifted by parts lead time. Bars past 100% are
          weeks you cannot deliver as promised.
        </p>

        <div className="surface-panel mt-6 overflow-x-auto p-6">
          <div className="flex min-w-[720px] items-end gap-3">
            {weeks.map((w) => {
              const top = Math.max(
                w.technicianUtilisation,
                w.installUtilisation,
                w.buildUtilisation,
              );
              return (
                <div key={w.weekStart} className="flex flex-1 flex-col items-center gap-2">
                  <span className="label-mono text-xs">{top > 0 ? pct(top) : "—"}</span>
                  <div className="flex h-40 w-full items-end bg-muted/40">
                    <div
                      className={`w-full transition-[height] ${
                        w.overbooked ? "bg-destructive" : "bg-energy"
                      }`}
                      style={{ height: `${Math.min(top, 1.6) * 62.5}%` }}
                    />
                  </div>
                  <span className="label-mono text-xs text-muted-foreground">{w.label}</span>
                  <span className="text-center text-[10px] text-muted-foreground">
                    {w.jobs > 0 ? w.bottleneck : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {weeks.some((w) => w.overbooked) && (
          <p className="mt-4 flex items-start gap-2 border border-destructive/60 bg-destructive/10 p-3 text-sm">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>
              Overbooked weeks:{" "}
              {weeks
                .filter((w) => w.overbooked)
                .map((w) => w.label)
                .join(", ")}
              . Move a job, add crew, or stop promising those dates.
            </span>
          </p>
        )}
      </section>

      {/* Forecast */}
      <section className="mt-14" aria-labelledby="forecast">
        <h2 id="forecast" className="font-display text-2xl font-semibold">
          04 — Throughput forecast
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Deliverable units per quarter at today&apos;s capacity, and what one more technician or
          build bay unlocks.
        </p>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="surface-panel space-y-6 p-6">
            <div className="space-y-3">
              <Label htmlFor="extra-techs">Add technicians: +{extraTechs}</Label>
              <Slider
                id="extra-techs"
                min={0}
                max={6}
                step={1}
                value={[extraTechs]}
                onValueChange={([v]) => setExtraTechs(v ?? 0)}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="extra-bays">Add build bays: +{extraBays}</Label>
              <Slider
                id="extra-bays"
                min={0}
                max={4}
                step={1}
                value={[extraBays]}
                onValueChange={([v]) => setExtraBays(v ?? 0)}
              />
            </div>
          </div>

          <div className="surface-panel grid grid-cols-2 gap-6 p-6">
            <div>
              <p className="label-mono text-muted-foreground">Today</p>
              <p className="mt-2 font-display text-4xl font-semibold">
                {baseline?.unitsPerQuarter ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">units / quarter</p>
              <p className="label-mono mt-3 text-xs">Limit: {baseline?.bottleneck}</p>
            </div>
            <div>
              <p className="label-mono text-energy">With added crew</p>
              <p className="mt-2 font-display text-4xl font-semibold text-energy">
                {whatIf?.unitsPerQuarter ?? 0}
              </p>
              <p className="text-xs text-muted-foreground">units / quarter</p>
              <p className="label-mono mt-3 text-xs">Next limit: {whatIf?.bottleneck}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Leads */}
      <section className="mt-14" aria-labelledby="leads">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="leads" className="font-display text-2xl font-semibold">
              05 — Lead readiness queue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Ranked by predicted likelihood to become a signed job. Model:{" "}
              <span className="text-foreground">{data.modelVersion}</span> · labelled outcomes:{" "}
              <span className="text-foreground">{labelledTotal}</span> / 150 needed to train the
              real model.
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              const res = await exportFn();
              const blob = new Blob([res.csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "eps-lead-training.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="label-mono inline-flex min-h-11 items-center gap-2 border border-border px-4 hover:border-energy hover:text-energy"
          >
            <Download className="size-4" aria-hidden="true" /> Export training data
          </button>
        </div>

        {!readyToTrain && (
          <p className="mt-4 border border-border bg-surface p-3 text-sm text-muted-foreground">
            Scores currently come from the transparent starter model. Keep marking leads won or
            lost — at {150 - labelledTotal} more labelled outcomes there is enough history to train
            the real model on your workshop machine.
          </p>
        )}

        <div className="mt-6 space-y-3">
          {data.leads.length === 0 && (
            <p className="surface-panel p-6 text-sm text-muted-foreground">
              No assessment requests yet.
            </p>
          )}
          {[...data.leads]
            .sort((a, b) => b.score - a.score)
            .map((lead) => {
              const band = scoreBand(lead.score);
              return (
                <article
                  key={lead.id}
                  className="surface-panel flex flex-wrap items-start gap-6 p-5"
                >
                  <div
                    className={`flex size-16 shrink-0 flex-col items-center justify-center border ${
                      band === "hot"
                        ? "border-energy text-energy"
                        : band === "warm"
                          ? "border-emerald text-emerald"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    <span className="font-display text-xl font-semibold">{lead.score}</span>
                    <span className="label-mono text-[10px]">{band}</span>
                  </div>

                  <div className="min-w-[16rem] flex-1">
                    <h3 className="font-display text-lg font-semibold">{lead.full_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {lead.solution_interest ?? "—"} · {lead.property_type ?? "—"} ·{" "}
                      {lead.monthly_bill_range ?? "—"} · ZIP {lead.zip_code}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {lead.email} · {lead.phone}
                      {lead.preferred_time ? ` · ${lead.preferred_time}` : ""}
                    </p>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {lead.reasons.slice(0, 4).map((r) => (
                        <li
                          key={r.label}
                          className="label-mono border border-border px-2 py-1 text-[10px]"
                        >
                          {r.weight > 0 ? "+" : "−"} {r.label}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    {(["won", "lost", "pending"] as const).map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => outcomeMutation.mutate({ id: lead.id, outcome: o })}
                        aria-pressed={lead.outcome === o}
                        className={`label-mono min-h-11 border px-3 text-xs ${
                          lead.outcome === o
                            ? "border-energy bg-energy/10 text-energy"
                            : "border-border hover:border-energy hover:text-energy"
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
        </div>
      </section>
    </main>
  );
}
