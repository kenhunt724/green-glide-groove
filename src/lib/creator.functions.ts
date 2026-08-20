import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type CreatorProgramStatus = {
  maxSlots: number;
  claimed: number;
  remaining: number;
  inviteOnly: boolean;
  maxMasterBytes: number;
};

export type CreatorItem = {
  id: string;
  kind: "audio" | "video" | "art";
  title: string;
  description: string;
  license_terms: string;
  price_cents: number | null;
  master_path: string | null;
  master_format: string | null;
  master_bytes: number | null;
  preview_path: string | null;
  artwork_path: string | null;
  sort_order: number;
  published: boolean;
  preview_url?: string | null;
  artwork_url?: string | null;
};

export type CreatorPage = {
  id: string;
  owner_user_id: string;
  handle: string;
  display_name: string;
  city: string;
  tagline: string;
  bio: string;
  accent: string;
  contact_email: string | null;
  rights_statement: string;
  platform_share_bps: number;
  published: boolean;
};

const handleRe = /^[a-z0-9][a-z0-9-]{1,39}$/;

const pageSchema = z.object({
  display_name: z.string().trim().min(2).max(120),
  city: z.string().trim().max(120).default("Atlanta, GA"),
  tagline: z.string().trim().max(200).default(""),
  bio: z.string().trim().max(4000).default(""),
  contact_email: z.string().trim().email().max(200).optional().or(z.literal("")),
  published: z.boolean().default(false),
});

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["audio", "video", "art"]),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).default(""),
  license_terms: z.string().trim().max(2000).default(""),
  price_cents: z.number().int().min(0).max(10_000_000).nullable().optional(),
  master_path: z.string().trim().max(400).nullable().optional(),
  master_format: z.string().trim().max(20).nullable().optional(),
  master_bytes: z.number().int().min(0).nullable().optional(),
  preview_path: z.string().trim().max(400).nullable().optional(),
  artwork_path: z.string().trim().max(400).nullable().optional(),
  published: z.boolean().default(false),
});

/* eslint-disable @typescript-eslint/no-explicit-any */
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

async function loadSettings(db: any): Promise<CreatorProgramStatus> {
  const { data: settings } = await db
    .from("creator_program_settings")
    .select("max_creator_slots, invite_only, max_master_bytes")
    .limit(1)
    .maybeSingle();
  const { count } = await db.from("creator_pages").select("id", { count: "exact", head: true });
  const maxSlots = settings?.max_creator_slots ?? 25;
  const claimed = count ?? 0;
  return {
    maxSlots,
    claimed,
    remaining: Math.max(0, maxSlots - claimed),
    inviteOnly: settings?.invite_only ?? true,
    maxMasterBytes: Number(settings?.max_master_bytes ?? 2147483648),
  };
}

async function sign(db: any, bucket: string, path: string | null | undefined) {
  if (!path) return null;
  const { data } = await db.storage.from(bucket).createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}

export const getCreatorProgramStatus = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  return loadSettings(db);
});

export const getPublicCreatorPage = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ handle: z.string().trim().max(60) }).parse(data))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: page } = await db
      .from("creator_pages")
      .select(
        "id, owner_user_id, handle, display_name, city, tagline, bio, accent, contact_email, rights_statement, platform_share_bps, published",
      )
      .eq("handle", data.handle)
      .eq("published", true)
      .maybeSingle();
    if (!page) return null;

    const { data: rows } = await db
      .from("creator_items")
      .select("*")
      .eq("page_id", page.id)
      .eq("published", true)
      .order("sort_order", { ascending: true });

    const items: CreatorItem[] = [];
    for (const row of (rows ?? []) as CreatorItem[]) {
      items.push({
        ...row,
        master_path: null,
        preview_url: await sign(db, "creator-previews", row.preview_path),
        artwork_url: await sign(db, "creator-previews", row.artwork_path),
      });
    }
    return { page: page as CreatorPage, items };
  });

export const getMyCreatorPage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const status = await loadSettings(db);
    const { data: page } = await db
      .from("creator_pages")
      .select("*")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!page) return { page: null, items: [] as CreatorItem[], status };

    const { data: rows } = await db
      .from("creator_items")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    const items: CreatorItem[] = [];
    for (const row of (rows ?? []) as CreatorItem[]) {
      items.push({
        ...row,
        preview_url: await sign(db, "creator-previews", row.preview_path),
        artwork_url: await sign(db, "creator-previews", row.artwork_path),
      });
    }
    return { page: page as CreatorPage, items, status };
  });

export const claimCreatorInvite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        code: z.string().trim().min(4).max(64),
        handle: z.string().trim().regex(handleRe, "Use lowercase letters, numbers and dashes."),
        display_name: z.string().trim().min(2).max(120),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const db = await admin();

    const { data: existing } = await db
      .from("creator_pages")
      .select("handle")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (existing) return { ok: false as const, error: "You already have a creator page." };

    const status = await loadSettings(db);
    if (status.remaining <= 0) {
      return { ok: false as const, error: "Every creator slot is currently filled." };
    }

    const { data: invite } = await db
      .from("creator_invites")
      .select("id, max_uses, used_count, expires_at, revoked")
      .eq("code", data.code.trim().toUpperCase())
      .maybeSingle();

    if (!invite || invite.revoked) return { ok: false as const, error: "That invite code is not valid." };
    if (invite.used_count >= invite.max_uses)
      return { ok: false as const, error: "That invite code has already been used." };
    if (invite.expires_at && new Date(invite.expires_at) < new Date())
      return { ok: false as const, error: "That invite code has expired." };

    const { error: insertError } = await db.from("creator_pages").insert({
      owner_user_id: context.userId,
      handle: data.handle,
      display_name: data.display_name,
      invite_id: invite.id,
    });
    if (insertError) {
      const taken = String(insertError.message ?? "").includes("creator_pages_handle_key");
      return {
        ok: false as const,
        error: taken ? "That page address is taken. Pick another." : "We could not create the page.",
      };
    }

    await db
      .from("creator_invites")
      .update({ used_count: invite.used_count + 1 })
      .eq("id", invite.id);

    return { ok: true as const, error: null, handle: data.handle };
  });

export const saveCreatorPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => pageSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { error } = await db
      .from("creator_pages")
      .update({
        display_name: data.display_name,
        city: data.city,
        tagline: data.tagline,
        bio: data.bio,
        contact_email: data.contact_email || null,
        published: data.published,
      })
      .eq("owner_user_id", context.userId);
    if (error) return { ok: false as const, error: "Could not save your page." };
    return { ok: true as const, error: null };
  });

export const saveCreatorItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => itemSchema.parse(data))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: page } = await db
      .from("creator_pages")
      .select("id")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!page) return { ok: false as const, error: "Create your page first." };

    const payload = {
      page_id: page.id,
      owner_user_id: context.userId,
      kind: data.kind,
      title: data.title,
      description: data.description,
      license_terms: data.license_terms,
      price_cents: data.price_cents ?? null,
      master_path: data.master_path ?? null,
      master_format: data.master_format ?? null,
      master_bytes: data.master_bytes ?? null,
      preview_path: data.preview_path ?? null,
      artwork_path: data.artwork_path ?? null,
      published: data.published,
    };

    const query = data.id
      ? db.from("creator_items").update(payload).eq("id", data.id).eq("owner_user_id", context.userId)
      : db.from("creator_items").insert(payload);

    const { error } = await query;
    if (error) return { ok: false as const, error: "Could not save that work." };
    return { ok: true as const, error: null };
  });

export const deleteCreatorItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const db = await admin();
    const { data: row } = await db
      .from("creator_items")
      .select("master_path, preview_path, artwork_path")
      .eq("id", data.id)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!row) return { ok: false as const, error: "Not found." };

    if (row.master_path) await db.storage.from("creator-masters").remove([row.master_path]);
    const previews = [row.preview_path, row.artwork_path].filter(Boolean) as string[];
    if (previews.length) await db.storage.from("creator-previews").remove(previews);

    await db.from("creator_items").delete().eq("id", data.id).eq("owner_user_id", context.userId);
    return { ok: true as const, error: null };
  });

/** Creator-owned export: manifest plus signed download links for every master. */
export const exportCreatorArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { data: page } = await db
      .from("creator_pages")
      .select("*")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!page) return { ok: false as const, error: "No page to export.", manifest: null };

    const { data: rows } = await db.from("creator_items").select("*").eq("page_id", page.id);
    const works = [];
    for (const row of (rows ?? []) as CreatorItem[]) {
      works.push({
        title: row.title,
        kind: row.kind,
        license_terms: row.license_terms,
        master_format: row.master_format,
        master_bytes: row.master_bytes,
        master_download_url: await sign(db, "creator-masters", row.master_path),
      });
    }

    return {
      ok: true as const,
      error: null,
      manifest: {
        exported_at: new Date().toISOString(),
        page,
        rights_statement: page.rights_statement,
        works,
      },
    };
  });

/** One-click takedown: removes every file and row without staff approval. */
export const takedownCreatorPage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const db = await admin();
    const { data: page } = await db
      .from("creator_pages")
      .select("id")
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!page) return { ok: false as const, error: "Nothing to remove." };

    const { data: rows } = await db
      .from("creator_items")
      .select("master_path, preview_path, artwork_path")
      .eq("page_id", page.id);

    const masters = ((rows ?? []) as CreatorItem[]).map((r) => r.master_path).filter(Boolean) as string[];
    const previews = ((rows ?? []) as CreatorItem[])
      .flatMap((r) => [r.preview_path, r.artwork_path])
      .filter(Boolean) as string[];
    if (masters.length) await db.storage.from("creator-masters").remove(masters);
    if (previews.length) await db.storage.from("creator-previews").remove(previews);

    await db.from("creator_pages").delete().eq("id", page.id).eq("owner_user_id", context.userId);
    return { ok: true as const, error: null };
  });
