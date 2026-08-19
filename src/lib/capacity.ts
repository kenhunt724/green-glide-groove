/**
 * Pure capacity math — shared by the server functions and the ops UI.
 * No Supabase, no browser APIs, so it is safe to import anywhere.
 */

export type CapacitySettings = {
  technician_days_per_week: number;
  vault_installs_per_week: number;
  generator_builds_per_week: number;
  service_visits_per_week: number;
  technician_count: number;
  build_bays: number;
};

export type JobProfile = {
  id: string;
  solution_interest: string;
  technician_days: number;
  build_hours: number;
  parts_lead_time_days: number;
  unit_kind: string;
};

export type PipelineJob = {
  id: string;
  solution_interest: string | null;
  scheduled_at: string | null;
  score: number;
};

export type WeekLoad = {
  weekStart: string;
  label: string;
  jobs: number;
  technicianDays: number;
  installs: number;
  builds: number;
  technicianUtilisation: number;
  installUtilisation: number;
  buildUtilisation: number;
  bottleneck: "Technicians" | "Install crew" | "Build bench" | "Clear";
  overbooked: boolean;
};

export const WEEK_MS = 7 * 86_400_000;

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = (d.getUTCDay() + 6) % 7; // Monday = 0
  d.setUTCDate(d.getUTCDate() - day);
  return d;
}

export function weekLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

const safeDiv = (a: number, b: number) => (b > 0 ? a / b : a > 0 ? Infinity : 0);

export function buildWeeklyLoad(
  jobs: PipelineJob[],
  profiles: JobProfile[],
  settings: CapacitySettings,
  weeks = 12,
  from: Date = new Date(),
): WeekLoad[] {
  const profileBy = new Map(profiles.map((p) => [p.solution_interest, p]));
  const first = startOfWeek(from);

  const buckets: WeekLoad[] = Array.from({ length: weeks }, (_, i) => {
    const start = new Date(first.getTime() + i * WEEK_MS).toISOString();
    return {
      weekStart: start,
      label: weekLabel(start),
      jobs: 0,
      technicianDays: 0,
      installs: 0,
      builds: 0,
      technicianUtilisation: 0,
      installUtilisation: 0,
      buildUtilisation: 0,
      bottleneck: "Clear",
      overbooked: false,
    };
  });

  const buildHoursPerWeek = settings.generator_builds_per_week;

  for (const job of jobs) {
    if (!job.scheduled_at) continue;
    const profile = profileBy.get(job.solution_interest ?? "");
    if (!profile) continue;

    // Work lands after the parts lead time on the booked assessment.
    const landing = new Date(
      new Date(job.scheduled_at).getTime() + profile.parts_lead_time_days * 86_400_000,
    );
    const index = Math.floor((startOfWeek(landing).getTime() - first.getTime()) / WEEK_MS);
    if (index < 0 || index >= weeks) continue;

    const bucket = buckets[index]!;
    // Weight the load by how likely the job is to actually land.
    const weight = Math.max(0.15, job.score / 100);
    bucket.jobs += 1;
    bucket.technicianDays += profile.technician_days * weight;
    if (profile.unit_kind === "build") bucket.builds += weight;
    else bucket.installs += weight;
  }

  for (const b of buckets) {
    b.technicianUtilisation = safeDiv(b.technicianDays, settings.technician_days_per_week);
    b.installUtilisation = safeDiv(b.installs, settings.vault_installs_per_week);
    b.buildUtilisation = safeDiv(b.builds, buildHoursPerWeek);

    const ranked: [WeekLoad["bottleneck"], number][] = [
      ["Technicians", b.technicianUtilisation],
      ["Install crew", b.installUtilisation],
      ["Build bench", b.buildUtilisation],
    ];
    ranked.sort((x, y) => y[1] - x[1]);
    const [name, value] = ranked[0]!;
    b.bottleneck = value > 0.01 ? name : "Clear";
    b.overbooked = value > 1;
  }

  return buckets;
}

export type ThroughputForecast = {
  unitsPerQuarter: number;
  technicianDaysPerQuarter: number;
  bottleneck: string;
};

/**
 * Steady-state deliverable units per quarter under a given crew shape.
 * extraTechnicians / extraBays are the what-if levers.
 */
export function forecastThroughput(
  settings: CapacitySettings,
  profiles: JobProfile[],
  extraTechnicians = 0,
  extraBays = 0,
): ThroughputForecast {
  const daysPerTech = settings.technician_count
    ? settings.technician_days_per_week / settings.technician_count
    : 5;
  const technicianDays = settings.technician_days_per_week + extraTechnicians * daysPerTech;

  const avgTechDays =
    profiles.length > 0
      ? profiles.reduce((s, p) => s + p.technician_days, 0) / profiles.length
      : 3;

  const buildsPerBay = settings.build_bays
    ? settings.generator_builds_per_week / settings.build_bays
    : settings.generator_builds_per_week;

  const techLimited = technicianDays / Math.max(avgTechDays, 0.1);
  const benchLimited =
    settings.vault_installs_per_week + settings.generator_builds_per_week + extraBays * buildsPerBay;

  const perWeek = Math.min(techLimited, benchLimited);
  return {
    unitsPerQuarter: Math.round(perWeek * 13),
    technicianDaysPerQuarter: Math.round(technicianDays * 13),
    bottleneck: techLimited <= benchLimited ? "Technician-days" : "Build & install bench",
  };
}
