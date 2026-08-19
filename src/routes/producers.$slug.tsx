import { useMemo, useState } from "react";
import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createProducerOrder,
  getProducerStore,
  type ProducerProduct,
  type ProducerStore,
} from "@/lib/producer-store.functions";

const storeQuery = (slug: string) =>
  queryOptions({
    queryKey: ["producer-store", slug],
    queryFn: () => getProducerStore({ data: { slug } }),
  });

export const Route = createFileRoute("/producers/$slug")({
  loader: async ({ context, params }) => {
    const store = await context.queryClient.ensureQueryData(storeQuery(params.slug));
    if (!store) throw notFound();
    return store;
  },
  head: ({ loaderData }) => {
    const name = (loaderData as ProducerStore | undefined)?.display_name ?? "Producer";
    const tagline =
      (loaderData as ProducerStore | undefined)?.tagline ??
      "Beats, stems and drum kits licensed direct from the producer.";
    return {
      meta: [
        { title: `${name} — Producer Store · Earth Protection Society` },
        { name: "description", content: `${tagline} Licensed direct from ${name} in Atlanta.` },
        { property: "og:title", content: `${name} — Producer Store` },
        { property: "og:description", content: tagline },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  errorComponent: ({ error }) => (
    <Shell>
      <h1 className="text-2xl font-semibold">This store could not load</h1>
      <p className="mt-3 text-muted-foreground">{(error as Error).message}</p>
    </Shell>
  ),
  notFoundComponent: () => (
    <Shell>
      <h1 className="text-2xl font-semibold">No such producer store</h1>
      <p className="mt-3 text-muted-foreground">
        This storefront is either unpublished or the link is wrong.
      </p>
      <Link to="/store" className="label-mono mt-6 inline-block text-signal">
        Back to the record store →
      </Link>
    </Shell>
  ),
  component: ProducerStorePage,
});

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main" className="mx-auto max-w-3xl px-5 py-24">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

function ProducerStorePage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(storeQuery(slug));
  const store = data!;

  const [cart, setCart] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "busy" | "ok" | "error"; msg?: string }>({
    kind: "idle",
  });

  const submitOrder = useServerFn(createProducerOrder);

  const cartItems = useMemo(
    () => store.products.filter((p) => cart.includes(p.id)),
    [cart, store.products],
  );
  const total = cartItems.reduce((s, p) => s + p.price_cents, 0);

  const toggle = (id: string) =>
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  async function checkout(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ kind: "busy" });
    try {
      const res = await submitOrder({
        data: { slug, buyer_name: name, buyer_email: email, product_ids: cart },
      });
      if (!res.ok) {
        setStatus({ kind: "error", msg: res.message });
        return;
      }
      setStatus({
        kind: "ok",
        msg: `Order reserved · ${res.item_count} item(s) · ${money(res.total_cents)}. Payment link is sent to ${email}.`,
      });
      setCart([]);
    } catch (err) {
      setStatus({ kind: "error", msg: (err as Error).message });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <p className="label-mono">Producer storefront · {store.city}</p>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold md:text-6xl">{store.display_name}</h1>
            <p className="mt-6 max-w-2xl text-lg text-signal">{store.tagline}</p>
            <p className="mt-6 max-w-3xl leading-relaxed text-muted-foreground">{store.bio}</p>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-5 py-16 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h2 className="text-2xl font-semibold">Licenses & downloads</h2>
            <p className="label-mono mt-2">Uncompressed delivery · 432Hz masters · artist-first split</p>

            <div className="mt-8 flex flex-col gap-px bg-border">
              {store.products.map((p) => (
                <ProductRow
                  key={p.id}
                  product={p}
                  inCart={cart.includes(p.id)}
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </div>
          </div>

          <aside className="h-fit border border-border bg-surface p-6 lg:sticky lg:top-24">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
              <ShoppingBag className="size-4 text-signal" aria-hidden="true" />
              Your cart
            </h2>

            {cartItems.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nothing selected yet. Add a license to start checkout.
              </p>
            ) : (
              <ul className="mt-4 space-y-2 text-sm">
                {cartItems.map((p) => (
                  <li key={p.id} className="flex justify-between gap-3 border-t border-border pt-2">
                    <span>{p.title}</span>
                    <span className="label-mono">{money(p.price_cents)}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-6 flex justify-between border-t border-border pt-3">
              <span className="label-mono">Total</span>
              <span className="font-display text-xl font-bold">{money(total)}</span>
            </div>

            <form onSubmit={checkout} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="buyer-name">Full name</Label>
                <Input
                  id="buyer-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  className="mt-2 h-11"
                />
              </div>
              <div>
                <Label htmlFor="buyer-email">Email for delivery</Label>
                <Input
                  id="buyer-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-11"
                />
              </div>
              <button
                type="submit"
                disabled={cart.length === 0 || status.kind === "busy"}
                className="w-full border border-signal/50 bg-signal/10 px-4 py-3 font-display text-xs font-semibold tracking-wide text-signal uppercase transition-colors hover:bg-signal/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {status.kind === "busy" ? "Reserving…" : "Checkout"}
              </button>
            </form>

            {status.msg && (
              <p
                aria-live="polite"
                className={`mt-4 text-sm ${status.kind === "error" ? "text-destructive" : "text-signal"}`}
              >
                {status.msg}
              </p>
            )}
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductRow({
  product,
  inCart,
  onToggle,
}: {
  product: ProducerProduct;
  inCart: boolean;
  onToggle: () => void;
}) {
  return (
    <article className="grid gap-4 bg-background p-6 transition-colors hover:bg-surface md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3">
          <h3 className="text-xl font-semibold">{product.title}</h3>
          <span className="label-mono">{product.kind}</span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="outline" className="label-mono border-signal/40 text-signal">
            {product.license_terms}
          </Badge>
          {product.bpm && (
            <Badge variant="outline" className="label-mono">
              {product.bpm} BPM
            </Badge>
          )}
          {product.song_key && (
            <Badge variant="outline" className="label-mono">
              {product.song_key}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 md:flex-col md:items-end">
        <span className="font-display text-2xl font-bold">{money(product.price_cents)}</span>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={inCart}
          className={`inline-flex min-h-11 items-center gap-2 border px-4 font-display text-xs font-semibold tracking-wide uppercase transition-colors ${
            inCart
              ? "border-signal bg-signal/20 text-signal"
              : "border-signal/50 bg-signal/10 text-signal hover:bg-signal/20"
          }`}
        >
          {inCart ? (
            <Minus className="size-3.5" aria-hidden="true" />
          ) : (
            <Plus className="size-3.5" aria-hidden="true" />
          )}
          {inCart ? "Remove" : "Add license"}
        </button>
      </div>
    </article>
  );
}
