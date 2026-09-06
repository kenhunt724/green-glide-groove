import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, AlertTriangle, Circle } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getStreamHealth } from "@/lib/stream-status.functions";

const TITLE = "Service Status & Uptime | Earth Protection Society";
const DESC =
  "Live availability of the Earth Protection Society broadcast and on-demand library, measured against our 99.5% uptime commitment.";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatusPage,
});

function Bar({ pct, checks }: { pct: number; checks: number }) {
  const tone =
    checks === 0 ? "bg-muted" : pct >= 99.5 ? "bg-energy" : pct >= 95 ? "bg-signal" : "bg-destructive";
  return <span className={`h-8 w-full rounded-sm ${tone}`} />;
}

function StatusPage() {
  const fetchHealth = useServerFn(getStreamHealth);
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["stream-health"],
    queryFn: () => fetchHealth(),
    refetchInterval: 60_000,
  });

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-5xl px-6 py-14">
        <p className="label-mono text-energy">Service status</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Uptime &amp; availability</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          We commit to 99.5% availability. Everything below is measured automatically every few
          minutes against the real endpoints — not typed in by hand.
        </p>

        <button
          type="button"
          onClick={() => refetch()}
          className="label-mono mt-6 rounded-md border border-border px-3 py-2 hover:bg-accent"
        >
          {isFetching ? "Refreshing…" : "Refresh now"}
        </button>

        {isLoading ? <p className="mt-8 text-sm text-muted-foreground">Loading…</p> : null}
        {error ? (
          <p className="mt-8 text-sm text-destructive">Could not load the status history.</p>
        ) : null}

        {data ? (
          <>
            <div className="mt-10 space-y-10">
              {data.targets.map((t) => (
                <section key={t.target} className="rounded-lg border border-border p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold">{t.label}</h2>
                    <span className="label-mono inline-flex items-center gap-2">
                      {t.lastOnline === null ? (
                        <>
                          <Circle className="h-4 w-4 text-muted-foreground" /> No data yet
                        </>
                      ) : t.lastOnline ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-energy" /> Operational
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-destructive" /> Down
                        </>
                      )}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {t.uptimePct === null
                      ? "Monitoring starts as soon as the first automatic check runs."
                      : `${t.uptimePct}% available over the last ${data.windowDays} days across ${t.checks} checks — ${
                          t.meetsSla ? "meeting" : "below"
                        } the ${data.slaTarget}% commitment.`}
                  </p>
                  {t.lastError ? (
                    <p className="mt-1 text-sm text-destructive">Last error: {t.lastError}</p>
                  ) : null}

                  <div className="mt-5 flex gap-[3px]">
                    {t.days.map((d) => (
                      <span key={d.day} className="flex-1" title={`${d.day}: ${d.checks ? `${d.uptimePct}%` : "no data"}`}>
                        <Bar pct={d.uptimePct} checks={d.checks} />
                      </span>
                    ))}
                  </div>
                  <div className="label-mono mt-2 flex justify-between text-muted-foreground">
                    <span>{data.windowDays} days ago</span>
                    <span>Today</span>
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-14">
              <h2 className="font-display text-xl font-semibold">Recent incidents</h2>
              {data.incidents.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  No outages recorded in the last {data.windowDays} days.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {data.incidents.map((i) => (
                    <li key={`${i.target}-${i.started_at}`} className="rounded-md border border-border p-4 text-sm">
                      <span className="label-mono text-destructive">{i.target}</span>{" "}
                      went down at {new Date(i.started_at).toLocaleString()}
                      {i.error ? ` — ${i.error}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
