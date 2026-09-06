import { createFileRoute } from "@tanstack/react-router";

/**
 * Uptime probe. Call on a schedule (cron / uptime service):
 *   GET /api/public/stream-check?token=<STREAM_CHECK_TOKEN>
 *
 * Records one row per endpoint in stream_checks and, when an endpoint has just
 * gone down, POSTs an alert to STREAM_ALERT_WEBHOOK_URL (Slack/Discord/e-mail
 * relay — any URL that accepts a JSON body with a `text` field).
 */
export const Route = createFileRoute("/api/public/stream-check")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const expected = process.env["STREAM_CHECK_TOKEN"];
        const url = new URL(request.url);
        const provided =
          url.searchParams.get("token") ??
          request.headers.get("x-stream-check-token") ??
          "";
        if (expected && provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        const owncast = (process.env["OWNCAST_URL"] ?? "").replace(/\/+$/, "");
        const peertube = (process.env["PEERTUBE_URL"] ?? "").replace(/\/+$/, "");

        const probe = async (target: string, endpoint: string) => {
          if (!endpoint) {
            return { target, online: false, live: false, viewers: null, latency_ms: null, error: "No endpoint configured" };
          }
          const started = Date.now();
          try {
            const res = await fetch(endpoint, {
              cache: "no-store",
              signal: AbortSignal.timeout(8000),
            });
            const latency = Date.now() - started;
            let live = false;
            let viewers: number | null = null;
            if (res.ok && target === "owncast") {
              try {
                const json = (await res.json()) as { online?: boolean; viewerCount?: number };
                live = !!json.online;
                viewers = typeof json.viewerCount === "number" ? json.viewerCount : null;
              } catch {
                /* body shape changed; availability still counts */
              }
            }
            return {
              target,
              online: res.ok,
              live,
              viewers,
              latency_ms: latency,
              error: res.ok ? null : `HTTP ${res.status}`,
            };
          } catch (e) {
            return {
              target,
              online: false,
              live: false,
              viewers: null,
              latency_ms: Date.now() - started,
              error: e instanceof Error ? e.message : "unreachable",
            };
          }
        };

        const results = await Promise.all([
          probe("owncast", owncast ? `${owncast}/api/status` : ""),
          probe("peertube", peertube ? `${peertube}/api/v1/config` : ""),
        ]);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Was each endpoint up on the previous check? Only alert on transitions.
        const previous = new Map<string, boolean>();
        const { data: lastRows } = await supabaseAdmin
          .from("stream_checks")
          .select("target, online, checked_at")
          .order("checked_at", { ascending: false })
          .limit(20);
        for (const row of lastRows ?? []) {
          if (!previous.has(row.target)) previous.set(row.target, row.online);
        }

        const { error: insertError } = await supabaseAdmin.from("stream_checks").insert(results);
        if (insertError) {
          return Response.json({ ok: false, error: insertError.message }, { status: 500 });
        }

        const webhook = process.env["STREAM_ALERT_WEBHOOK_URL"];
        const transitions = results.filter(
          (r) => previous.get(r.target) !== false && !r.online,
        );
        const recovered = results.filter((r) => previous.get(r.target) === false && r.online);

        if (webhook && (transitions.length || recovered.length)) {
          const lines = [
            ...transitions.map((r) => `DOWN: ${r.target} — ${r.error ?? "unreachable"}`),
            ...recovered.map((r) => `RECOVERED: ${r.target}`),
          ];
          try {
            await fetch(webhook, {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                text: `Earth Protection Society streaming\n${lines.join("\n")}`,
              }),
              signal: AbortSignal.timeout(8000),
            });
          } catch {
            /* never fail the check because the alert relay is down */
          }
        }

        return Response.json({
          ok: true,
          checked_at: new Date().toISOString(),
          results,
          alerted: transitions.length + recovered.length,
        });
      },
    },
  },
});
