import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type AdminStore = {
  id: string;
  handle: string;
  display_name: string;
  city: string;
  tagline: string;
  published: boolean;
  owner_user_id: string;
  owner_email: string | null;
  item_count: number;
  created_at: string;
};

const handleRe = /^[a-z0-9][a-z0-9-]{1,39}$/;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function assertAdmin(context: any) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error || data !== true) throw new Error("Admin access required.");
}

async function emailMap(db: any, ids: string[]) {
  const map = new Map<string, string | null>();
  if (ids.length === 0) return map;
  const { data } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
  for (const u of data?.users ?? []) map.set(u.id, u.email ?? null);
  return map;
}

export const listClientStores = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStore[]> => {
    await assertAdmin(context);
    const db = await admin();

    const { data: pages } = await db
      .from("creator_pages")
      .select("id, handle, display_name, city, tagline, published, owner_user_id, created_at")
      .order("created_at", { ascending: false });

    const rows = (pages ?? []) as Omit<AdminStore, "owner_email" | "item_count">[];
    const emails = await emailMap(db, rows.map((r) => r.owner_user_id));

    const out: AdminStore[] = [];
    for (const row of rows) {
      const { count } = await db
        .from("creator_items")
        .select("id", { count: "exact", head: true })
        .eq("page_id", row.id);
      out.push({ ...row, owner_email: emails.get(row.owner_user_id) ?? null, item_count: count ?? 0 });
    }
    return out;
  });

export const createClientStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        handle: z.string().trim().toLowerCase().regex(handleRe, "Use lowercase letters, numbers and dashes."),
        display_name: z.string().trim().min(2).max(120),
        city: z.string().trim().max(120).default("Atlanta, GA"),
        tagline: z.string().trim().max(200).default(""),
        owner_email: z.string().trim().email().max(200),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = await admin();
    const email = data.owner_email.toLowerCase();

    const { data: list } = await db.auth.admin.listUsers({ page: 1, perPage: 200 });
    let user = (list?.users ?? []).find((u: any) => (u.email ?? "").toLowerCase() === email);
    let created = false;

    if (!user) {
      const { data: made, error } = await db.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: { display_name: data.display_name },
      });
      if (error || !made?.user) {
        return { ok: false as const, error: "Could not create an account for that email." };
      }
      user = made.user;
      created = true;
    }

    const { data: existing } = await db
      .from("creator_pages")
      .select("handle")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    if (existing) {
      return { ok: false as const, error: `That client already has a store at /c/${existing.handle}.` };
    }

    const { error: insertError } = await db.from("creator_pages").insert({
      owner_user_id: user.id,
      handle: data.handle,
      display_name: data.display_name,
      city: data.city,
      tagline: data.tagline,
      contact_email: email,
    });
    if (insertError) {
      const taken = String(insertError.message ?? "").includes("creator_pages_handle_key");
      return {
        ok: false as const,
        error: taken ? "That store address is taken. Pick another." : "Could not create the store.",
      };
    }

    return { ok: true as const, error: null, handle: data.handle, accountCreated: created };
  });

export const updateClientStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        display_name: z.string().trim().min(2).max(120),
        city: z.string().trim().max(120),
        tagline: z.string().trim().max(200),
        published: z.boolean(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = await admin();
    const { error } = await db
      .from("creator_pages")
      .update({
        display_name: data.display_name,
        city: data.city,
        tagline: data.tagline,
        published: data.published,
      })
      .eq("id", data.id);
    if (error) return { ok: false as const, error: "Could not save that store." };
    return { ok: true as const, error: null };
  });

export const deleteClientStore = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = await admin();
    const { error } = await db.from("creator_pages").delete().eq("id", data.id);
    if (error) return { ok: false as const, error: "Could not remove that store." };
    return { ok: true as const, error: null };
  });

export const sendClientAccessLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ email: z.string().trim().email().max(200), redirect_to: z.string().trim().max(400) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const db = await admin();
    const { data: link, error } = await db.auth.admin.generateLink({
      type: "magiclink",
      email: data.email.toLowerCase(),
      options: { redirectTo: data.redirect_to },
    });
    if (error || !link?.properties?.action_link) {
      return { ok: false as const, error: "Could not generate a sign-in link.", link: null };
    }
    return { ok: true as const, error: null, link: link.properties.action_link as string };
  });
