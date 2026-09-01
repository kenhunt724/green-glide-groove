/**
 * Digital twin math — pure functions shared by the server functions and the ops UI.
 * No Supabase, no browser APIs, so this file is safe to import anywhere.
 *
 * Until a unit ships real telemetry, the twin runs a deterministic simulation
 * from what we already know about the unit (age, weekly cycles, duty factor).
 * The moment a real reading lands in unit_telemetry, that reading wins.
 */

export type FleetUnit = {
  id: string;
  unit_code: string;
  customer_name: string;
  site_label: string | null;
  unit_kind: string;
  pack_kwh: number;
  module_count: number;
  commissioned_at: string;
  cycles_per_week: number;
  duty_factor: number;
  service_contract: boolean;
  status: string;
  notes: string | null;
};

export type Telemetry = {
  recorded_at: string;
  state_of_health: number;
  pack_voltage: number;
  max_cell_temp_c: number;
  cell_delta_mv: number;
  cycle_count: number;
  inverter_hours: number;
  fault_code: string | null;
  simulated: boolean;
};

export type ComponentWear = {
  name: string;
  /** 0–100, how much of its service life is used up. */
  wearPct: number;
  /** Days until it should be replaced at the current duty. */
  remainingDays: number;
  action: string;
};

export type UnitAssessment = {
  unit: FleetUnit;
  telemetry: Telemetry;
  ageDays: number;
  /** 0–100 overall health. */
  healthScore: number;
  band: "healthy" | "watch" | "service";
  components: ComponentWear[];
  nextPart: ComponentWear;
  alerts: string[];
};

const DAY = 86_400_000;

export const UNIT_KIND_LABEL: Record<string, string> = {
  cart: "E-Generator cart",
  power_pod: "Residential / commercial power pod",
  trailer: "Power trailer",
  container: "Container battery plant",
};

export const kindLabel = (kind: string) => UNIT_KIND_LABEL[kind] ?? kind;

/** Stable 0–1 jitter per unit so simulated numbers do not jump on every render. */
function seedNoise(seed: string, salt: number): number {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export function ageDaysOf(unit: FleetUnit, now: Date): number {
  return Math.max(0, (now.getTime() - new Date(unit.commissioned_at).getTime()) / DAY);
}

/** Deterministic stand-in telemetry derived from the unit's declared duty. */
export function simulateTelemetry(unit: FleetUnit, now: Date): Telemetry {
  const days = ageDaysOf(unit, now);
  const cycles = Math.round((days / 7) * unit.cycles_per_week * unit.duty_factor);

  // LiFePO4-style wear: cycle fade toward 80% at ~6000 cycles, plus calendar fade.
  const cycleFade = (cycles / 6000) * 20;
  const calendarFade = (days / 365) * 1.2;
  const soh = clamp(100 - cycleFade - calendarFade, 55, 100);

  const nominal = unit.unit_kind === "container" ? 819 : unit.pack_kwh >= 40 ? 51.2 : 25.6;
  const noise = seedNoise(unit.unit_code, 7);

  return {
    recorded_at: now.toISOString(),
    state_of_health: Math.round(soh * 10) / 10,
    pack_voltage: Math.round(nominal * (0.97 + noise * 0.05) * 10) / 10,
    max_cell_temp_c: Math.round((26 + unit.duty_factor * 8 + noise * 4) * 10) / 10,
    cell_delta_mv: Math.round(8 + (100 - soh) * 2.2 + noise * 6),
    cycle_count: cycles,
    inverter_hours: Math.round(days * 6 * unit.duty_factor),
    fault_code: null,
    simulated: true,
  };
}

type WearSpec = { name: string; lifeUnits: number; unitsPerDay: number; action: string };

function wearSpecs(unit: FleetUnit, t: Telemetry, days: number): WearSpec[] {
  const cyclesPerDay = Math.max(0.1, (unit.cycles_per_week * unit.duty_factor) / 7);
  const hoursPerDay = Math.max(1, 6 * unit.duty_factor);
  return [
    {
      name: "Battery modules",
      lifeUnits: 6000,
      unitsPerDay: cyclesPerDay,
      action: "Plan module rotation before the pack drops under 80% state of health.",
    },
    {
      name: "Inverter / power stage",
      lifeUnits: 45_000,
      unitsPerDay: hoursPerDay,
      action: "Schedule a power-stage swap and keep a spare on the shelf.",
    },
    {
      name: "Cooling fans & filters",
      lifeUnits: 9_000,
      unitsPerDay: hoursPerDay * (t.max_cell_temp_c > 38 ? 1.4 : 1),
      action: "Replace fans and clean filters on the next service visit.",
    },
    {
      name: "DC contactors",
      lifeUnits: 30_000,
      unitsPerDay: cyclesPerDay * 2,
      action: "Contactor cycles are finite — replace before weld-on failure.",
    },
    {
      name: "BMS balance leads",
      lifeUnits: 2_600,
      unitsPerDay: 1 + (t.cell_delta_mv > 45 ? 0.8 : 0),
      action: "Re-torque and inspect balance leads; drifting cells wear them first.",
    },
  ].map((s) => ({ ...s, lifeUnits: s.lifeUnits * (days > 0 ? 1 : 1) }));
}

export function assessUnit(unit: FleetUnit, reading: Telemetry | null, now: Date): UnitAssessment {
  const telemetry = reading ?? simulateTelemetry(unit, now);
  const days = ageDaysOf(unit, now);

  const components: ComponentWear[] = wearSpecs(unit, telemetry, days)
    .map((spec) => {
      const used = spec.unitsPerDay * days;
      const wearPct = clamp((used / spec.lifeUnits) * 100, 0, 100);
      const remainingDays = Math.max(
        0,
        Math.round((spec.lifeUnits - used) / Math.max(0.01, spec.unitsPerDay)),
      );
      return { name: spec.name, wearPct: Math.round(wearPct), remainingDays, action: spec.action };
    })
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const worstWear = Math.max(...components.map((c) => c.wearPct));
  const healthScore = Math.round(
    clamp(
      telemetry.state_of_health * 0.6 +
        (100 - worstWear) * 0.3 +
        (telemetry.cell_delta_mv > 60 ? 0 : 10),
      0,
      100,
    ),
  );

  const alerts: string[] = [];
  if (telemetry.fault_code) alerts.push(`Active fault code ${telemetry.fault_code}.`);
  if (telemetry.state_of_health < 82)
    alerts.push(`Pack at ${telemetry.state_of_health}% state of health — module rotation is due.`);
  if (telemetry.cell_delta_mv > 60)
    alerts.push(`Cell spread ${telemetry.cell_delta_mv} mV — balance or a weak module.`);
  if (telemetry.max_cell_temp_c > 42)
    alerts.push(`Hottest cell at ${telemetry.max_cell_temp_c} °C — check airflow and filters.`);
  const soon = components.filter((c) => c.remainingDays < 120);
  for (const c of soon) alerts.push(`${c.name}: ~${c.remainingDays} days of life left.`);
  if (!unit.service_contract)
    alerts.push("No service contract on this unit — parts replacement is not covered.");

  const band: UnitAssessment["band"] =
    healthScore >= 80 && alerts.length === 0 ? "healthy" : healthScore >= 68 ? "watch" : "service";

  return {
    unit,
    telemetry,
    ageDays: Math.round(days),
    healthScore,
    band,
    components,
    nextPart: components[0],
    alerts,
  };
}

export type FleetRollup = {
  units: number;
  simulated: number;
  underContract: number;
  avgHealth: number;
  partsDue90: number;
  openAlerts: number;
};

export function rollUpFleet(assessments: UnitAssessment[]): FleetRollup {
  const units = assessments.length;
  return {
    units,
    simulated: assessments.filter((a) => a.telemetry.simulated).length,
    underContract: assessments.filter((a) => a.unit.service_contract).length,
    avgHealth: units
      ? Math.round(assessments.reduce((s, a) => s + a.healthScore, 0) / units)
      : 0,
    partsDue90: assessments.filter((a) => a.nextPart && a.nextPart.remainingDays < 90).length,
    openAlerts: assessments.reduce((s, a) => s + a.alerts.length, 0),
  };
}

/** Plain-language work queue, most urgent first. */
export function serviceQueue(assessments: UnitAssessment[]): {
  unitCode: string;
  customer: string;
  part: string;
  inDays: number;
  action: string;
  covered: boolean;
}[] {
  return assessments
    .filter((a) => a.nextPart)
    .map((a) => ({
      unitCode: a.unit.unit_code,
      customer: a.unit.customer_name,
      part: a.nextPart.name,
      inDays: a.nextPart.remainingDays,
      action: a.nextPart.action,
      covered: a.unit.service_contract,
    }))
    .sort((x, y) => x.inDays - y.inDays);
}
