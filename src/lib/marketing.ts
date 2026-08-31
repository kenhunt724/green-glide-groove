/**
 * Channel performance model.
 *
 * Stage A of the marketing side of the business model: with zero history the
 * honest thing is not a black box, it is a ranking that is statistically
 * careful about small samples. We use the Wilson lower bound on the win rate,
 * which asks "given how few leads this channel produced, what is the worst
 * plausible true conversion rate?". A channel with 1 win out of 1 lead does
 * not outrank a channel with 6 wins out of 10.
 *
 * Once enough labelled outcomes exist the same shape gets replaced by the
 * trained coefficients from scripts/train_lead_scorer.py.
 */

export type ChannelStats = {
  channel: string;
  leads: number;
  booked: number;
  won: number;
  lost: number;
  pending: number;
  /** Naive win rate over resolved leads, 0-1. */
  winRate: number;
  /** Small-sample-safe ranking score, 0-1. */
  confidence: number;
  /** Mean readiness score of the leads this channel produced, 0-100. */
  avgScore: number;
  /** How much evidence we have: none | thin | usable. */
  evidence: "none" | "thin" | "usable";
};

/** Wilson score interval, lower bound at ~95% confidence. */
export function wilsonLowerBound(successes: number, total: number): number {
  if (total === 0) return 0;
  const z = 1.96;
  const p = successes / total;
  const denom = 1 + (z * z) / total;
  const centre = p + (z * z) / (2 * total);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * total)) / total);
  return Math.max(0, (centre - margin) / denom);
}

export type ChannelLead = {
  channel: string | null;
  outcome: string;
  score: number;
  booked: boolean;
};

export function summariseChannels(leads: ChannelLead[]): ChannelStats[] {
  const map = new Map<string, ChannelLead[]>();
  for (const l of leads) {
    const key = l.channel && l.channel.trim() ? l.channel.trim() : "Unattributed";
    const bucket = map.get(key);
    if (bucket) bucket.push(l);
    else map.set(key, [l]);
  }

  const stats: ChannelStats[] = [];
  for (const [channel, group] of map) {
    const won = group.filter((l) => l.outcome === "won").length;
    const lost = group.filter((l) => l.outcome === "lost").length;
    const pending = group.length - won - lost;
    const resolved = won + lost;
    stats.push({
      channel,
      leads: group.length,
      booked: group.filter((l) => l.booked).length,
      won,
      lost,
      pending,
      winRate: resolved ? won / resolved : 0,
      confidence: wilsonLowerBound(won, resolved),
      avgScore: group.length
        ? Math.round(group.reduce((s, l) => s + l.score, 0) / group.length)
        : 0,
      evidence: resolved === 0 ? "none" : resolved < 8 ? "thin" : "usable",
    });
  }

  return stats.sort(
    (a, b) => b.confidence - a.confidence || b.avgScore - a.avgScore || b.leads - a.leads,
  );
}

/** Leads per ISO week, oldest first, for the last `weeks` weeks. */
export function weeklyVolume(
  createdAt: string[],
  weeks = 8,
  now: Date = new Date(),
): { label: string; count: number }[] {
  const out: { label: string; count: number }[] = [];
  const end = now.getTime();
  for (let i = weeks - 1; i >= 0; i--) {
    const from = end - (i + 1) * 7 * 86_400_000;
    const to = end - i * 7 * 86_400_000;
    out.push({
      label: i === 0 ? "This week" : `-${i}w`,
      count: createdAt.filter((c) => {
        const t = new Date(c).getTime();
        return t > from && t <= to;
      }).length,
    });
  }
  return out;
}

/** Plain-language guidance derived from the stats above. */
export function channelActions(stats: ChannelStats[], totalLeads: number): string[] {
  const actions: string[] = [];
  if (totalLeads === 0) {
    return [
      "No leads recorded yet. Every conversation counts: log walk-ups and phone calls in the panel below so the model has something to learn from.",
      "Put a tagged link (?utm_source=linkedin) on your LinkedIn profile and posts so those visits attribute themselves.",
    ];
  }

  const unattributed = stats.find((s) => s.channel === "Unattributed");
  if (unattributed && unattributed.leads / totalLeads > 0.3) {
    actions.push(
      `${Math.round((unattributed.leads / totalLeads) * 100)}% of leads have no source. Ask every caller how they found you and log it — untracked leads teach the model nothing.`,
    );
  }

  const usable = stats.filter((s) => s.evidence === "usable");
  if (usable.length === 0) {
    actions.push(
      "No channel has enough resolved outcomes yet. Keep marking leads won or lost in the capacity console — around 8 resolved per channel is where the ranking gets trustworthy.",
    );
  } else {
    const best = usable[0]!;
    actions.push(
      `${best.channel} is your strongest channel so far (${best.won}/${best.won + best.lost} resolved leads won). Spend more of your week there.`,
    );
    const worst = usable[usable.length - 1]!;
    if (usable.length > 1 && worst.confidence < best.confidence / 2) {
      actions.push(
        `${worst.channel} is producing volume but not closes (${worst.won}/${worst.won + worst.lost}). Either change the pitch there or move that time to ${best.channel}.`,
      );
    }
  }

  const volumeNoClose = stats.find(
    (s) => s.channel !== "Unattributed" && s.leads >= 5 && s.booked / s.leads < 0.4,
  );
  if (volumeNoClose) {
    actions.push(
      `${volumeNoClose.channel} leads rarely book a slot (${volumeNoClose.booked}/${volumeNoClose.leads}). The handoff, not the traffic, is the leak — call them the same day.`,
    );
  }

  return actions;
}
