import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

const applicationSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  role: z.string().trim().min(2).max(120),
  linkedin_url: z.string().trim().max(300).optional().or(z.literal("")),
  resume_text: z.string().trim().max(5000).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type TalentApplicationInput = z.infer<typeof applicationSchema>;

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

export const submitTalentApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => applicationSchema.parse(data))
  .handler(async ({ data }) => {
    const supabase = publicClient();

    const { error } = await supabase.from("talent_applications").insert({
      full_name: data.full_name,
      email: data.email,
      phone: data.phone ? data.phone : null,
      role: data.role,
      linkedin_url: data.linkedin_url ? data.linkedin_url : null,
      resume_text: data.resume_text ? data.resume_text : null,
      notes: data.notes ? data.notes : null,
    });

    if (error) {
      console.error("talent application insert failed", error);
      throw new Error("We could not save your application. Please try again.");
    }

    return { ok: true as const };
  });
