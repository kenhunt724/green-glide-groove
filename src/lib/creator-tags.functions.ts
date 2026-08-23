import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateTrackTags } from "./track-tagging.server";

/* eslint-disable @typescript-eslint/no-explicit-any */

export const tagCreatorItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: row } = await db
      .from("creator_items")
      .select("id, kind, title, description, license_terms, master_format, master_path")
      .eq("id", data.id)
      .eq("owner_user_id", context.userId)
      .maybeSingle();
    if (!row) return { ok: false as const, error: "Not found." };

    try {
      const tags = await generateTrackTags({
        kind: row.kind,
        title: row.title,
        description: row.description,
        license_terms: row.license_terms,
        master_format: row.master_format,
        filename: row.master_path ? String(row.master_path).split("/").pop() : null,
      });

      const { error } = await db
        .from("creator_items")
        .update({
          ai_tags: tags.tags,
          ai_genre: tags.genre,
          ai_mood: tags.mood,
          ai_instruments: tags.instruments,
          ai_bpm: tags.bpm,
          ai_key: tags.musical_key,
          ai_summary: tags.summary,
          ai_tagged_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("owner_user_id", context.userId);
      if (error) return { ok: false as const, error: "Could not save the tags." };

      return { ok: true as const, error: null, tags };
    } catch (err) {
      const status = (err as { status?: number }).status;
      if (status === 429) return { ok: false as const, error: "Tagging is rate limited. Try again shortly." };
      if (status === 402)
        return { ok: false as const, error: "AI credits are exhausted. Add credits to keep tagging." };
      return { ok: false as const, error: "Tagging failed. Try again." };
    }
  });

export const tagAllUntaggedItems = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const db = supabaseAdmin as any;

    const { data: rows } = await db
      .from("creator_items")
      .select("id, kind, title, description, license_terms, master_format, master_path")
      .eq("owner_user_id", context.userId)
      .is("ai_tagged_at", null)
      .limit(25);

    let tagged = 0;
    let failed = 0;
    let stopped: string | null = null;

    for (const row of (rows ?? []) as any[]) {
      try {
        const tags = await generateTrackTags({
          kind: row.kind,
          title: row.title,
          description: row.description,
          license_terms: row.license_terms,
          master_format: row.master_format,
          filename: row.master_path ? String(row.master_path).split("/").pop() : null,
        });
        await db
          .from("creator_items")
          .update({
            ai_tags: tags.tags,
            ai_genre: tags.genre,
            ai_mood: tags.mood,
            ai_instruments: tags.instruments,
            ai_bpm: tags.bpm,
            ai_key: tags.musical_key,
            ai_summary: tags.summary,
            ai_tagged_at: new Date().toISOString(),
          })
          .eq("id", row.id)
          .eq("owner_user_id", context.userId);
        tagged += 1;
      } catch (err) {
        const status = (err as { status?: number }).status;
        if (status === 402 || status === 403 || status === 429) {
          stopped =
            status === 429
              ? "Rate limited part-way through. Run it again in a minute."
              : "AI credits or access are unavailable. Add credits and run it again.";
          break;
        }
        failed += 1;
      }
    }

    return { ok: true as const, tagged, failed, stopped };
  });
