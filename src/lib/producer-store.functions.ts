import { createServerFn } from "@tanstack/react-start";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type ProducerProduct = {
  id: string;
  title: string;
  kind: string;
  description: string;
  license_terms: string;
  price_cents: number;
  bpm: number | null;
  song_key: string | null;
  preview_url: string | null;
  artwork_url: string | null;
};

export type ProducerStore = {
  id: string;
  slug: string;
  display_name: string;
  city: string;
  tagline: string;
  bio: string;
  platform_share_bps: number;
  products: ProducerProduct[];
};

function publicClient() {
  const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Backend is not configured");

  return createClient(url, key, {
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

export const getProducerStore = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) =>
    z.object({ slug: z.string().trim().min(1).max(80) }).parse(data),
  )
  .handler(async ({ data }): Promise<ProducerStore | null> => {
    const supabase = publicClient();

    const { data: producer, error } = await supabase
      .from("producers")
      .select("id, slug, display_name, city, tagline, bio, platform_share_bps")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!producer) return null;

    const { data: products, error: productErr } = await supabase
      .from("producer_products")
      .select(
        "id, title, kind, description, license_terms, price_cents, bpm, song_key, preview_url, artwork_url",
      )
      .eq("producer_id", producer.id)
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (productErr) throw new Error(productErr.message);

    return {
      ...(producer as Omit<ProducerStore, "products">),
      products: (products ?? []) as ProducerProduct[],
    };
  });

const orderSchema = z.object({
  slug: z.string().trim().min(1).max(80),
  buyer_name: z.string().trim().min(2).max(120),
  buyer_email: z.string().trim().email().max(200),
  product_ids: z.array(z.string().uuid()).min(1).max(30),
});

export const createProducerOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as SupabaseClient;

    const { data: producer, error: prodErr } = await admin
      .from("producers")
      .select("id, platform_share_bps")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (prodErr) throw new Error(prodErr.message);
    if (!producer) return { ok: false as const, message: "That storefront is not available." };

    const prod = producer as { id: string; platform_share_bps: number };

    // Price server-side; never trust client totals.
    const { data: products, error: itemsErr } = await admin
      .from("producer_products")
      .select("id, title, price_cents")
      .eq("producer_id", prod.id)
      .eq("published", true)
      .in("id", data.product_ids);
    if (itemsErr) throw new Error(itemsErr.message);

    const items = (products ?? []) as { id: string; title: string; price_cents: number }[];
    if (items.length === 0) {
      return { ok: false as const, message: "Those items are no longer available." };
    }

    const total = items.reduce((sum, i) => sum + i.price_cents, 0);
    const platformFee = Math.round((total * prod.platform_share_bps) / 10000);
    const payout = total - platformFee;

    const { data: order, error: orderErr } = await admin
      .from("producer_orders")
      .insert({
        producer_id: prod.id,
        buyer_email: data.buyer_email,
        buyer_name: data.buyer_name,
        items,
        total_cents: total,
        platform_fee_cents: platformFee,
        producer_payout_cents: payout,
        status: "pending",
      })
      .select("id")
      .single();
    if (orderErr) throw new Error(orderErr.message);

    return {
      ok: true as const,
      order_id: (order as { id: string }).id,
      total_cents: total,
      item_count: items.length,
    };
  });

