import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

const leadSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  zip_code: z.string().trim().min(3).max(12),
  property_type: z.string().trim().min(2).max(80),
  monthly_bill_range: z.string().trim().min(1).max(80),
  roof_condition: z.string().trim().min(1).max(80),
  preferred_time: z.string().trim().min(1).max(120),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type EnergyLeadInput = z.infer<typeof leadSchema>;

export const submitEnergyLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];

    if (!url || !key) throw new Error("Backend is not configured");

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error } = await supabase.from("energy_leads").insert({
      ...data,
      notes: data.notes ? data.notes : null,
    });

    if (error) {
      console.error("energy lead insert failed", error);
      throw new Error("We could not save your request. Please try again.");
    }

    return { ok: true as const };
  });
