import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scoreLead } from "@/lib/lead-model";
import { summariseChannels, weeklyVolume, channelActions, type ChannelStats } from "@/lib/marketing";

export type MarketingSnapshot = {
  totalLeads: number;
  resolved: number;
  channels: ChannelStats[];
  weekly: { label: string; count: number }[];
  campaigns: { campaign: string; leads: number }[];
  actions: string[];
};

export const getMarketingSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<MarketingSnapshot> => {
    const { data, error } = await context.supabase
      .from("energy_leads")
      .select(
        "created_at, outcome, slot_id, source_channel, utm_campaign, utm_source, monthly_bill_range, solution_interest, property_type, notes",
      )
      .order("created_at", { ascending: false })
      .limit(2000);

    if (error) throw new Error("You do not have access to the marketing data.");

    const rows = data ?? [];
    const now = new Date();

    const leads = rows.map((l) => ({
      channel: l.source_channel,
      outcome: l.outcome,
      booked: Boolean(l.slot_id),
      score: scoreLead(
        {
          monthly_bill_range: l.monthly_bill_range,
          solution_interest: l.solution_interest,
          property_type: l.property_type,
          slot_id: l.slot_id,
          notes: l.notes,
          created_at: l.created_at,
          source_channel: l.source_channel,

        },
        now,
      ).score,
    }));

    const channels = summariseChannels(leads);
    const campaignMap = new Map<string, number>();
    for (const l of rows) {
      const key = l.utm_campaign?.trim() || l.utm_source?.trim();
      if (!key) continue;
      campaignMap.set(key, (campaignMap.get(key) ?? 0) + 1);
    }

    return {
      totalLeads: rows.length,
      resolved: rows.filter((l) => l.outcome !== "pending").length,
      channels,
      weekly: weeklyVolume(
        rows.map((l) => l.created_at),
        8,
        now,
      ),
      campaigns: [...campaignMap.entries()]
        .map(([campaign, leads]) => ({ campaign, leads }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 10),
      actions: channelActions(channels, rows.length),
    };
  });

const manualLeadSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(40),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  zip_code: z.string().trim().min(3).max(12),
  source_channel: z.string().trim().min(2).max(80),
  source_detail: z.string().trim().max(200).optional().or(z.literal("")),
  solution_interest: z.string().trim().max(80).optional().or(z.literal("")),
  property_type: z.string().trim().max(80).optional().or(z.literal("")),
  monthly_bill_range: z.string().trim().max(80).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

/** Log a lead met in person or over the phone, so off-site conversations still train the model. */
export const logManualLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => manualLeadSchema.parse(input))
  .handler(async ({ data, context }) => {
    const blank = (v: string | undefined) => (v && v.trim() ? v.trim() : null);
    const { error } = await context.supabase.from("energy_leads").insert({
      full_name: data.full_name,
      email: data.email?.trim() || `no-email+${Date.now()}@earthresonancehub.com`,
      phone: data.phone,
      zip_code: data.zip_code,
      solution_interest: blank(data.solution_interest),
      property_type: data.property_type?.trim() || "Unspecified",
      monthly_bill_range: data.monthly_bill_range?.trim() || "Unknown",
      preferred_time: "Logged manually",
      notes: blank(data.notes),
      source_channel: data.source_channel,
      source_detail: blank(data.source_detail),
      entry_mode: "manual",
    });
    if (error) throw new Error("Could not save that lead.");

    const { appendLeadToSheet } = await import("@/lib/sheets.server");
    await appendLeadToSheet({
      full_name: data.full_name,
      phone: data.phone,
      email: blank(data.email),
      zip_code: data.zip_code,
      solution_interest: blank(data.solution_interest),
      property_type: data.property_type?.trim() || "Unspecified",
      monthly_bill_range: data.monthly_bill_range?.trim() || "Unknown",
      preferred_time: "Logged manually",
      source_channel: data.source_channel,
      source_detail: blank(data.source_detail),
      entry_mode: "manual",
      notes: blank(data.notes),
    });

    return { ok: true };
  });
