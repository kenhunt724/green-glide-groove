import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scoreLead, COEFFICIENTS } from "@/lib/lead-model";
import type { CapacitySettings, JobProfile, PipelineJob } from "@/lib/capacity";

export type OpsLead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  zip_code: string;
  solution_interest: string | null;
  property_type: string | null;
  monthly_bill_range: string | null;
  preferred_time: string | null;
  notes: string | null;
  created_at: string;
  outcome: string;
  score: number;
  reasons: { label: string; weight: number }[];
  scheduled_at: string | null;
};

export type OpsSnapshot = {
  settings: CapacitySettings;
  profiles: JobProfile[];
  leads: OpsLead[];
  jobs: PipelineJob[];
  labelled: { won: number; lost: number; pending: number };
  modelVersion: string;
};

const settingsSchema = z.object({
  technician_days_per_week: z.number().min(0).max(500),
  vault_installs_per_week: z.number().min(0).max(200),
  generator_builds_per_week: z.number().min(0).max(500),
  service_visits_per_week: z.number().min(0).max(500),
  technician_count: z.number().int().min(0).max(200),
  build_bays: z.number().int().min(0).max(100),
});

const profileSchema = z.object({
  id: z.string().uuid(),
  technician_days: z.number().min(0).max(100),
  build_hours: z.number().min(0).max(1000),
  parts_lead_time_days: z.number().int().min(0).max(365),
});

const outcomeSchema = z.object({
  id: z.string().uuid(),
  outcome: z.enum(["pending", "won", "lost"]),
});

export const getOpsSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<OpsSnapshot> => {
    const { supabase } = context;

    const [settingsRes, profilesRes, leadsRes, slotsRes] = await Promise.all([
      supabase.from("capacity_settings").select("*").limit(1).maybeSingle(),
      supabase.from("job_profiles").select("*").order("solution_interest"),
      supabase.from("energy_leads").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("consultation_slots").select("id, slot_at"),
    ]);

    if (settingsRes.error || profilesRes.error || leadsRes.error) {
      throw new Error("You do not have access to the operations data.");
    }

    const slotAt = new Map((slotsRes.data ?? []).map((s) => [s.id, s.slot_at]));
    const now = new Date();

    const leads: OpsLead[] = (leadsRes.data ?? []).map((l) => {
      const { score, reasons } = scoreLead(
        {
          monthly_bill_range: l.monthly_bill_range,
          solution_interest: l.solution_interest,
          property_type: l.property_type,
          slot_id: l.slot_id,
          notes: l.notes,
          created_at: l.created_at,
        },
        now,
      );
      return {
        id: l.id,
        full_name: l.full_name,
        email: l.email,
        phone: l.phone,
        zip_code: l.zip_code,
        solution_interest: l.solution_interest,
        property_type: l.property_type,
        monthly_bill_range: l.monthly_bill_range,
        preferred_time: l.preferred_time,
        notes: l.notes,
        created_at: l.created_at,
        outcome: l.outcome,
        score,
        reasons,
        scheduled_at: l.slot_id ? (slotAt.get(l.slot_id) ?? null) : null,
      };
    });

    const settingsRow = settingsRes.data;

    return {
      settings: {
        technician_days_per_week: Number(settingsRow?.technician_days_per_week ?? 10),
        vault_installs_per_week: Number(settingsRow?.vault_installs_per_week ?? 2),
        generator_builds_per_week: Number(settingsRow?.generator_builds_per_week ?? 4),
        service_visits_per_week: Number(settingsRow?.service_visits_per_week ?? 3),
        technician_count: Number(settingsRow?.technician_count ?? 2),
        build_bays: Number(settingsRow?.build_bays ?? 1),
      },
      profiles: (profilesRes.data ?? []).map((p) => ({
        id: p.id,
        solution_interest: p.solution_interest,
        technician_days: Number(p.technician_days),
        build_hours: Number(p.build_hours),
        parts_lead_time_days: p.parts_lead_time_days,
        unit_kind: p.unit_kind,
      })),
      leads,
      jobs: leads
        .filter((l) => l.outcome !== "lost")
        .map((l) => ({
          id: l.id,
          solution_interest: l.solution_interest,
          scheduled_at: l.scheduled_at,
          score: l.score,
        })),
      labelled: {
        won: leads.filter((l) => l.outcome === "won").length,
        lost: leads.filter((l) => l.outcome === "lost").length,
        pending: leads.filter((l) => l.outcome === "pending").length,
      },
      modelVersion: COEFFICIENTS.version,
    };
  });

export const saveCapacitySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => settingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const existing = await supabase.from("capacity_settings").select("id").limit(1).maybeSingle();
    if (!existing.data) throw new Error("Capacity settings row is missing.");

    const { error } = await supabase
      .from("capacity_settings")
      .update(data)
      .eq("id", existing.data.id);
    if (error) throw new Error("Could not save capacity settings.");
    return { ok: true };
  });

export const saveJobProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => profileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("job_profiles")
      .update({
        technician_days: data.technician_days,
        build_hours: data.build_hours,
        parts_lead_time_days: data.parts_lead_time_days,
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not save the job profile.");
    return { ok: true };
  });

export const setLeadOutcome = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => outcomeSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("energy_leads")
      .update({
        outcome: data.outcome,
        outcome_at: data.outcome === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", data.id);
    if (error) throw new Error("Could not record the outcome.");
    return { ok: true };
  });

/** Export labelled leads as CSV for local model training on the workshop machine. */
export const exportTrainingCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("energy_leads")
      .select(
        "monthly_bill_range, solution_interest, property_type, slot_id, notes, created_at, outcome",
      )
      .neq("outcome", "pending")
      .limit(5000);
    if (error) throw new Error("Could not export training data.");

    const header = "bill_range,solution_interest,property_type,booked_slot,has_notes,age_days,label";
    const rows = (data ?? []).map((l) => {
      const ageDays = Math.round((Date.now() - new Date(l.created_at).getTime()) / 86_400_000);
      const esc = (v: string | null) => `"${(v ?? "").replace(/"/g, '""')}"`;
      return [
        esc(l.monthly_bill_range),
        esc(l.solution_interest),
        esc(l.property_type),
        l.slot_id ? 1 : 0,
        l.notes && l.notes.trim().length > 12 ? 1 : 0,
        ageDays,
        l.outcome === "won" ? 1 : 0,
      ].join(",");
    });

    return { csv: [header, ...rows].join("\n"), rows: rows.length };
  });
