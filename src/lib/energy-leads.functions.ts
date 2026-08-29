import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const leadSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  zip_code: z.string().trim().min(3).max(12),
  solution_interest: z.string().trim().min(2).max(80),
  property_type: z.string().trim().min(2).max(80),
  monthly_bill_range: z.string().trim().min(1).max(80),
  roof_condition: z.string().trim().min(1).max(80).optional().or(z.literal("")),
  preferred_time: z.string().trim().min(1).max(120),
  slot_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type EnergyLeadInput = z.infer<typeof leadSchema>;

export type ConsultationSlot = {
  id: string;
  slot_at: string;
  duration_minutes: number;
};

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

export const listConsultationSlots = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = publicClient();
  const { data, error } = await supabase
    .from("consultation_slots")
    .select("id, slot_at, duration_minutes")
    .eq("is_booked", false)
    .gt("slot_at", new Date(Date.now() + 60 * 60 * 1000).toISOString())
    .order("slot_at", { ascending: true })
    .limit(120);

  if (error) {
    console.error("slot fetch failed", error);
    return { slots: [] as ConsultationSlot[], error: "Availability is temporarily unavailable." };
  }

  return { slots: (data ?? []) as ConsultationSlot[], error: null };
});

export const submitEnergyLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Atomically claim the slot before creating the lead. When no slots are
    // available the form submits without one and we schedule by phone.
    let claimed: { id: string; slot_at: string; duration_minutes: number } | null = null;
    if (data.slot_id) {
      const { data: slot, error: claimError } = await supabaseAdmin
        .from("consultation_slots")
        .update({ is_booked: true })
        .eq("id", data.slot_id)
        .eq("is_booked", false)
        .select("id, slot_at, duration_minutes")
        .maybeSingle();

      if (claimError) {
        console.error("slot claim failed", claimError);
        throw new Error("We could not reserve that time. Please try again.");
      }
      if (!slot) {
        throw new Error("That slot was just taken. Please pick another time.");
      }
      claimed = slot;
    }

    const { slot_id, notes, roof_condition, ...lead } = data;
    const { data: inserted, error } = await supabaseAdmin
      .from("energy_leads")
      .insert({
        ...lead,
        roof_condition: roof_condition ? roof_condition : null,
        notes: notes ? notes : null,
        slot_id: claimed ? claimed.id : null,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("energy lead insert failed", error);
      if (claimed) {
        await supabaseAdmin
          .from("consultation_slots")
          .update({ is_booked: false, lead_id: null })
          .eq("id", claimed.id);
      }
      throw new Error("We could not save your request. Please try again.");
    }

    if (claimed) {
      await supabaseAdmin
        .from("consultation_slots")
        .update({ lead_id: inserted.id })
        .eq("id", claimed.id);
    }

    return {
      ok: true as const,
      slot_at: claimed ? claimed.slot_at : null,
      duration: claimed ? claimed.duration_minutes : null,
    };
  });
