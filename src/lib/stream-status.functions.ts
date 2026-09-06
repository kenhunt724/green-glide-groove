import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const OWNCAST = (process.env["OWNCAST_URL"] ?? "").replace(/\/+$/, "");
const PEERTUBE = (process.env["PEERTUBE_URL"] ?? "").replace(/\/+$/, "");

export const SLA_TARGET = 99.5;

function publicClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export type StreamCheck = {
  checked_at: string;
  target: string;
  online: boolean;
  live: boolean;
  viewers: number | null;
  latency_ms: number | null;
  error: string | null;
};

export type StreamHealth = {
  windowDays: number;
  slaTarget: number;
  targets: {
    target: string;
    label: string;
    checks: number;
    uptimePct: number | null;
    meetsSla: boolean | null;
    lastCheckAt: string | null;
    lastOnline: boolean | null;
    lastError: string | null;
    days: { day: string; uptimePct: number; checks: number }[];
  }[];
  incidents: { started_at: string; target: string; error: string | null }[];
};

const LABELS: Record<string, string> = {
  owncast: "Live stream",
  peertube: "On-demand library",
};

export const getStreamHealth = createServerFn({ method: "GET" }).handler(
  async (): Promise<StreamHealth> => {
    const supabase = publicClient();
    const windowDays = 30;
    const since = new Date(Date.now() - windowDays * 86_400_000).toISOString();

    const { data, error } = await supabase
      .from("stream_checks")
      .select("checked_at, target, online, live, viewers, latency_ms, error")
      .gte("checked_at", since)
      .order("checked_at", { ascending: false })
      .limit(5000);

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as StreamCheck[];
    const targetNames = ["owncast", "peertube"];

    const targets = targetNames.map((target) => {
      const list = rows.filter((r) => r.target === target);
      const checks = list.length;
      const up = list.filter((r) => r.online).length;
      const uptimePct = checks ? Math.round((up / checks) * 10000) / 100 : null;

      const byDay = new Map<string, { up: number; total: number }>();
      for (const row of list) {
        const day = row.checked_at.slice(0, 10);
        const entry = byDay.get(day) ?? { up: 0, total: 0 };
        entry.total += 1;
        if (row.online) entry.up += 1;
        byDay.set(day, entry);
      }

      const days = Array.from({ length: windowDays }, (_, i) => {
        const d = new Date(Date.now() - (windowDays - 1 - i) * 86_400_000)
          .toISOString()
          .slice(0, 10);
        const entry = byDay.get(d);
        return {
          day: d,
          checks: entry?.total ?? 0,
          uptimePct: entry?.total ? Math.round((entry.up / entry.total) * 10000) / 100 : 0,
        };
      });

      const last = list[0] ?? null;
      return {
        target,
        label: LABELS[target] ?? target,
        checks,
        uptimePct,
        meetsSla: uptimePct === null ? null : uptimePct >= SLA_TARGET,
        lastCheckAt: last?.checked_at ?? null,
        lastOnline: last ? last.online : null,
        lastError: last?.error ?? null,
        days,
      };
    });

    const incidents: StreamHealth["incidents"] = [];
    for (const target of targetNames) {
      const list = rows.filter((r) => r.target === target).slice().reverse();
      let inIncident = false;
      for (const row of list) {
        if (!row.online && !inIncident) {
          incidents.push({ started_at: row.checked_at, target, error: row.error });
          inIncident = true;
        } else if (row.online) {
          inIncident = false;
        }
      }
    }
    incidents.sort((a, b) => b.started_at.localeCompare(a.started_at));

    return { windowDays, slaTarget: SLA_TARGET, targets, incidents: incidents.slice(0, 12) };
  },
);

/** Live one-shot probe used by the status page "check now" button. */
export const probeStreamNow = createServerFn({ method: "GET" }).handler(async () => {
  const probe = async (name: string, url: string) => {
    if (!url) return { target: name, online: false, error: "No endpoint configured" };
    const started = Date.now();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      return {
        target: name,
        online: res.ok,
        latency_ms: Date.now() - started,
        error: res.ok ? null : `HTTP ${res.status}`,
      };
    } catch (e) {
      return {
        target: name,
        online: false,
        latency_ms: Date.now() - started,
        error: e instanceof Error ? e.message : "unreachable",
      };
    }
  };

  return Promise.all([
    probe("owncast", OWNCAST ? `${OWNCAST}/api/status` : ""),
    probe("peertube", PEERTUBE ? `${PEERTUBE}/api/v1/config` : ""),
  ]);
});
