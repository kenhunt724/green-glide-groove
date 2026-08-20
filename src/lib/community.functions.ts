import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const signupSchema = z.object({
  kind: z.enum(["apprentice", "shop"]),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().min(7).max(40),
  neighborhood: z.string().trim().min(2).max(120),
  trade_interest: z.string().trim().max(120).optional().or(z.literal("")),
  shop_name: z.string().trim().max(160).optional().or(z.literal("")),
  capabilities: z.string().trim().max(1000).optional().or(z.literal("")),
  availability: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type CommunitySignupInput = z.infer<typeof signupSchema>;

export const submitCommunitySignup = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("community_signups").insert({
      kind: data.kind,
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      neighborhood: data.neighborhood,
      trade_interest: data.trade_interest || null,
      shop_name: data.shop_name || null,
      capabilities: data.capabilities || null,
      availability: data.availability || null,
      notes: data.notes || null,
    });

    if (error) {
      console.error("community signup failed", error);
      return { ok: false as const, error: "We could not record that. Please try again." };
    }

    return { ok: true as const, error: null };
  });
