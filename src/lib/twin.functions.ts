import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assessUnit,
  rollUpFleet,
  serviceQueue,
  type FleetRollup,
  type FleetUnit,
  type Telemetry,
  type UnitAssessment,
} from "@/lib/twin";

export type TwinSnapshot = {
  assessments: UnitAssessment[];
  rollup: FleetRollup;
  queue: ReturnType<typeof serviceQueue>;
};

const unitSchema = z.object({
  id: z.string().uuid(),
  cycles_per_week: z.number().min(0).max(60),
  duty_factor: z.number().min(0.2).max(3),
  service_contract: z.boolean(),
});

export const getTwinSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TwinSnapshot> => {
    const { supabase } = context;

    const [unitsRes, readingsRes] = await Promise.all([
      supabase.from("fleet_units").select("*").order("unit_code"),
      supabase
        .from("unit_telemetry")
        .select("*")
        .order("recorded_at", { ascending: false })
        .limit(1000),
    ]);

    if (unitsRes.error) throw new Error("You do not have access to the fleet data.");

    const latest = new Map<string, Telemetry>();
    for (const r of readingsRes.data ?? []) {
      if (latest.has(r.unit_id)) continue;
      latest.set(r.unit_id, {
        recorded_at: r.recorded_at,
        state_of_health: Number(r.state_of_health ?? 100),
        pack_voltage: Number(r.pack_voltage ?? 0),
        max_cell_temp_c: Number(r.max_cell_temp_c ?? 0),
        cell_delta_mv: Number(r.cell_delta_mv ?? 0),
        cycle_count: Number(r.cycle_count ?? 0),
        inverter_hours: Number(r.inverter_hours ?? 0),
        fault_code: r.fault_code,
        simulated: false,
      });
    }

    const now = new Date();
    const assessments = (unitsRes.data ?? []).map((u) => {
      const unit: FleetUnit = {
        id: u.id,
        unit_code: u.unit_code,
        customer_name: u.customer_name,
        site_label: u.site_label,
        unit_kind: u.unit_kind,
        pack_kwh: Number(u.pack_kwh),
        module_count: u.module_count,
        commissioned_at: u.commissioned_at,
        cycles_per_week: Number(u.cycles_per_week),
        duty_factor: Number(u.duty_factor),
        service_contract: u.service_contract,
        status: u.status,
        notes: u.notes,
      };
      return assessUnit(unit, latest.get(u.id) ?? null, now);
    });

    assessments.sort((a, b) => a.healthScore - b.healthScore);

    return {
      assessments,
      rollup: rollUpFleet(assessments),
      queue: serviceQueue(assessments),
    };
  });

export const saveUnitDuty = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => unitSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("fleet_units")
      .update({
        cycles_per_week: data.cycles_per_week,
        duty_factor: data.duty_factor,
        service_contract: data.service_contract,
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not save this unit.");
    return { ok: true };
  });
