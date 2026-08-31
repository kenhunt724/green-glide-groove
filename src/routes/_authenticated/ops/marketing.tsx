import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getMarketingSnapshot, logManualLead } from "@/lib/marketing.functions";
import { sourceChannels } from "@/lib/attribution";
import { billRanges, siteTypes, solutionInterests } from "@/content/energy";

export const Route = createFileRoute("/_authenticated/ops/marketing")({
  component: MarketingConsole,
  head: () => ({
    meta: [
      { title: "Channel Console | Earth Protection Society Operations" },
      {
        name: "description",
        content:
          "Internal marketing console: which channels bring in EPS energy leads, how they convert, and where to spend the next hour of outreach.",
      },
      { property: "og:title", content: "Channel Console | Earth Protection Society" },
      {
        property: "og:description",
        content: "Internal view of lead sources, conversion by channel, and outreach guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const emptyManual = {
  full_name: "",
  phone: "",
  email: "",
  zip_code: "",
  source_channel: "Met someone from EPS in person" as string,
  source_detail: "",
  solution_interest: "",
  property_type: "",
  monthly_bill_range: "",
  notes: "",
};

function MarketingConsole() {
  const snapshotFn = useServerFn(getMarketingSnapshot);
  const logFn = useServerFn(logManualLead);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["marketing-snapshot"],
    queryFn: () => snapshotFn(),
    retry: false,
  });

  const [manual, setManual] = useState(emptyManual);
  const [formError, setFormError] = useState<string | null>(null);
  const setField = (k: keyof typeof emptyManual) => (v: string) =>
    setManual((m) => ({ ...m, [k]: v }));

  const logMutation = useMutation({
    mutationFn: (payload: typeof emptyManual) => logFn({ data: payload }),
    onSuccess: () => {
      setManual(emptyManual);
      qc.invalidateQueries({ queryKey: ["marketing-snapshot"] });
      qc.invalidateQueries({ queryKey: ["ops-snapshot"] });
    },
    onError: (e) => setFormError(e instanceof Error ? e.message : "Could not save that lead."),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-energy" aria-label="Loading channel data" />
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

  const peak = Math.max(1, ...data.weekly.map((w) => w.count));
  const manualValid =
    manual.full_name.trim().length > 1 &&
    manual.phone.trim().length >= 7 &&
    manual.zip_code.trim().length >= 3 &&
    manual.source_channel !== "";

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-6 py-12">
      <header>
        <p className="label-mono text-energy">Operations / channel engine</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Where the work comes from</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Every lead now carries the channel that produced it. This page ranks those channels by
          how well they actually convert — carefully, so a single lucky close does not send you
          chasing the wrong room.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <Link to="/ops/capacity" className="label-mono inline-block text-energy">
            Go to the capacity console →
          </Link>
          <button
            type="button"
            className="label-mono inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs hover:border-energy disabled:opacity-50"
            disabled={exporting}
            onClick={async () => {
              setExporting(true);
              try {
                const res = await exportFn();
                const blob = new Blob([res.csv], { type: "text/csv" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "eps-lead-training.csv";
                a.click();
                URL.revokeObjectURL(url);
              } finally {
                setExporting(false);
              }
            }}
          >
            {exporting ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            Export training data for the workshop machine
          </button>
        </div>
        <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
          The export now carries the channel and how the lead came in, so the local trainer on your
          Omen learns which rooms convert. Nothing trains in the cloud — run{" "}
          <code>python scripts/train_lead_scorer.py eps-lead-training.csv</code> at home, then push
          the updated weights.
        </p>
      </header>


      {/* Headline numbers */}
      <section className="mt-10 grid gap-4 sm:grid-cols-3" aria-label="Pipeline summary">
        {[
          ["Leads recorded", String(data.totalLeads)],
          ["Resolved won/lost", String(data.resolved)],
          ["Channels seen", String(data.channels.length)],
        ].map(([label, value]) => (
          <div key={label} className="surface-panel p-5">
            <p className="label-mono">{label}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </section>

      {/* Guidance */}
      <section className="mt-12" aria-labelledby="guidance">
        <h2 id="guidance" className="font-display text-2xl font-semibold">
          01 — What the numbers say to do next
        </h2>
        <ul className="surface-panel mt-4 space-y-3 p-6 text-sm leading-relaxed">
          {data.actions.map((a) => (
            <li key={a} className="flex gap-3">
              <span className="text-energy" aria-hidden="true">
                →
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Channel table */}
      <section className="mt-12" aria-labelledby="channels">
        <h2 id="channels" className="font-display text-2xl font-semibold">
          02 — Channel performance
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ranked by a small-sample-safe conversion estimate, not by raw win rate.
        </p>
        <div className="surface-panel mt-6 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Channel", "Leads", "Booked", "Won", "Lost", "Win rate", "Rank score", "Avg readiness", "Evidence"].map(
                  (h) => (
                    <th key={h} className="label-mono px-4 py-3 font-normal">
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {data.channels.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-muted-foreground">
                    No leads yet. Log your first conversation below.
                  </td>
                </tr>
              )}
              {data.channels.map((c) => (
                <tr key={c.channel} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3">{c.channel}</td>
                  <td className="px-4 py-3">{c.leads}</td>
                  <td className="px-4 py-3">{c.booked}</td>
                  <td className="px-4 py-3 text-emerald">{c.won}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.lost}</td>
                  <td className="px-4 py-3">{Math.round(c.winRate * 100)}%</td>
                  <td className="px-4 py-3 text-energy">{Math.round(c.confidence * 100)}</td>
                  <td className="px-4 py-3">{c.avgScore}</td>
                  <td className="label-mono px-4 py-3">{c.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Volume trend */}
      <section className="mt-12" aria-labelledby="volume">
        <h2 id="volume" className="font-display text-2xl font-semibold">
          03 — Lead volume, last 8 weeks
        </h2>
        <div className="surface-panel mt-6 flex items-end gap-3 p-6" role="img" aria-label="Weekly lead volume">
          {data.weekly.map((w) => (
            <div key={w.label} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs text-muted-foreground">{w.count}</span>
              <div
                className="w-full bg-energy/70"
                style={{ height: `${Math.max(4, (w.count / peak) * 120)}px` }}
              />
              <span className="label-mono">{w.label}</span>
            </div>
          ))}
        </div>
        {data.campaigns.length > 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Tagged links:{" "}
            {data.campaigns.map((c) => `${c.campaign} (${c.leads})`).join(", ")}
          </p>
        )}
      </section>

      {/* Manual logging */}
      <section className="mt-12" aria-labelledby="log">
        <h2 id="log" className="font-display text-2xl font-semibold">
          04 — Log a conversation
        </h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Most of your leads start face to face or on the phone. Log them here and they join the
          same pipeline, scoring and channel ranking as web leads.
        </p>
        <form
          className="surface-panel mt-6 grid gap-5 p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            setFormError(null);
            if (manualValid) logMutation.mutate(manual);
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="m-name">Name</Label>
            <Input
              id="m-name"
              value={manual.full_name}
              onChange={(e) => setField("full_name")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-phone">Phone</Label>
            <Input
              id="m-phone"
              type="tel"
              value={manual.phone}
              onChange={(e) => setField("phone")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-email">Email (optional)</Label>
            <Input
              id="m-email"
              type="email"
              value={manual.email}
              onChange={(e) => setField("email")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-zip">ZIP code</Label>
            <Input
              id="m-zip"
              inputMode="numeric"
              value={manual.zip_code}
              onChange={(e) => setField("zip_code")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-channel">How did they find you?</Label>
            <select
              id="m-channel"
              value={manual.source_channel}
              onChange={(e) => setField("source_channel")(e.target.value)}
              className="min-h-11 w-full border border-border bg-surface px-3 text-sm"
            >
              {sourceChannels.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-detail">Who or where, exactly? (optional)</Label>
            <Input
              id="m-detail"
              value={manual.source_detail}
              onChange={(e) => setField("source_detail")(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-solution">Interested in</Label>
            <select
              id="m-solution"
              value={manual.solution_interest}
              onChange={(e) => setField("solution_interest")(e.target.value)}
              className="min-h-11 w-full border border-border bg-surface px-3 text-sm"
            >
              <option value="">Not sure yet</option>
              {solutionInterests.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-property">Site type</Label>
            <select
              id="m-property"
              value={manual.property_type}
              onChange={(e) => setField("property_type")(e.target.value)}
              className="min-h-11 w-full border border-border bg-surface px-3 text-sm"
            >
              <option value="">Unspecified</option>
              {siteTypes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-bill">Monthly utility spend</Label>
            <select
              id="m-bill"
              value={manual.monthly_bill_range}
              onChange={(e) => setField("monthly_bill_range")(e.target.value)}
              className="min-h-11 w-full border border-border bg-surface px-3 text-sm"
            >
              <option value="">Unknown</option>
              {billRanges.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="m-notes">Notes from the conversation</Label>
            <Textarea
              id="m-notes"
              rows={3}
              value={manual.notes}
              onChange={(e) => setField("notes")(e.target.value)}
            />
          </div>
          {formError && (
            <p role="alert" className="sm:col-span-2 border border-destructive/60 bg-destructive/10 p-3 text-sm">
              {formError}
            </p>
          )}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!manualValid || logMutation.isPending}
              className="label-mono inline-flex min-h-11 items-center gap-2 bg-energy px-6 font-semibold text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {logMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Plus className="size-4" aria-hidden="true" />
              )}
              Add to pipeline
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
