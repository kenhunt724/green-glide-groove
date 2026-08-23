import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getPublicCreatorPage } from "@/lib/creator.functions";

const pageQuery = (handle: string) =>
  queryOptions({
    queryKey: ["creator-page", handle],
    queryFn: () => getPublicCreatorPage({ data: { handle } }),
  });

export const Route = createFileRoute("/c/$handle")({
  loader: async ({ context, params }) => {
    const result = await context.queryClient.ensureQueryData(pageQuery(params.handle));
    if (!result) throw notFound();
    return result;
  },
  errorComponent: () => (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl font-semibold">Page unavailable</h1>
      <p className="mt-3 text-muted-foreground">We could not load this creator page right now.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl font-semibold">No such creator page</h1>
      <p className="mt-3 text-muted-foreground">This page is not published, or the address is wrong.</p>
    </main>
  ),
  head: ({ loaderData }) => {
    const page = loaderData?.page;
    const name = page?.display_name ?? "Creator";
    const tagline = page?.tagline || `Uncompressed masters from ${name}.`;
    return {
      meta: [
        { title: `${name} — Creator Vault · Earth Protection Society` },
        { name: "description", content: `${tagline} Audio, video and art masters owned outright by ${name}.` },
        { property: "og:title", content: `${name} — Creator Vault` },
        { property: "og:description", content: tagline },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CreatorPublicPage,
});

function CreatorPublicPage() {
  const { handle } = Route.useParams();
  const { data } = useSuspenseQuery(pageQuery(handle));
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const items = data?.items ?? [];
  const allTags = useMemo(
    () =>
      Array.from(
        new Set(items.flatMap((i) => [...(i.ai_tags ?? []), ...(i.ai_instruments ?? [])])),
      ).sort(),
    [items],
  );
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      const tags = [...(item.ai_tags ?? []), ...(item.ai_instruments ?? [])];
      if (activeTag && !tags.includes(activeTag)) return false;
      if (!q) return true;
      return [item.title, item.kind, item.description, item.ai_genre ?? "", item.ai_mood ?? "", ...tags]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, query, activeTag]);

  if (!data) return null;
  const { page } = data;

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <p className="label-mono text-energy">{page.city}</p>
          <h1 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">{page.display_name}</h1>
          {page.tagline && <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{page.tagline}</p>}
          {page.bio && <p className="mt-6 max-w-2xl whitespace-pre-line text-muted-foreground">{page.bio}</p>}
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold">Works</h2>

            {items.length > 0 && (
              <div className="mt-6 space-y-4">
                <div className="relative w-full max-w-md">
                  <label htmlFor="works-search" className="sr-only">
                    Search these works by title, tag, genre or mood
                  </label>
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="works-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search titles, tags, genre, mood…"
                    className="h-11 pl-9"
                  />
                </div>
                {allTags.length > 0 && (
                  <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-2">
                    {allTags.map((tag) => {
                      const active = tag === activeTag;
                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setActiveTag(active ? null : tag)}
                          className={`label-mono min-h-9 border px-3 text-xs transition-colors ${
                            active
                              ? "border-energy bg-energy/10 text-energy"
                              : "border-border text-muted-foreground hover:border-energy hover:text-energy"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                )}
                <p aria-live="polite" className="label-mono text-xs">
                  {visible.length} of {items.length} {items.length === 1 ? "work" : "works"}
                </p>
              </div>
            )}

            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {visible.map((item) => (
                <li key={item.id} className="surface-panel space-y-4 p-6">
                  <div>
                    <p className="label-mono text-xs text-energy">{item.kind}</p>
                    <p className="mt-2 font-display text-xl font-semibold">{item.title}</p>
                    {item.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                    )}
                  </div>

                  {item.kind === "audio" && item.preview_url && (
                    <audio controls preload="none" src={item.preview_url} className="w-full">
                      <track kind="captions" />
                    </audio>
                  )}
                  {item.kind === "video" && item.preview_url && (
                    <video controls preload="none" src={item.preview_url} className="w-full">
                      <track kind="captions" />
                    </video>
                  )}
                  {item.kind === "art" && (item.preview_url || item.artwork_url) && (
                    <img
                      src={(item.preview_url ?? item.artwork_url) as string}
                      alt={`${item.title} by ${page.display_name}`}
                      loading="lazy"
                      className="w-full border border-border"
                    />
                  )}

                  {(item.ai_genre || item.ai_mood || item.ai_bpm || item.ai_key) && (
                    <p className="label-mono text-xs text-energy">
                      {[item.ai_genre, item.ai_mood, item.ai_bpm ? `${item.ai_bpm} bpm` : null, item.ai_key]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                  {(item.ai_tags?.length || item.ai_instruments?.length) && (
                    <div className="flex flex-wrap gap-1.5">
                      {[...(item.ai_tags ?? []), ...(item.ai_instruments ?? [])].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setActiveTag(tag)}
                          className="label-mono border border-border px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-energy hover:text-energy"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="label-mono text-xs text-muted-foreground">
                    Master: {item.master_format?.toUpperCase() ?? "uncompressed"} · owned by {page.display_name}
                  </p>
                  {item.license_terms && (
                    <p className="text-xs text-muted-foreground">{item.license_terms}</p>
                  )}
                </li>
              ))}
              {items.length === 0 && (
                <li className="text-sm text-muted-foreground">No published works yet.</li>
              )}
              {items.length > 0 && visible.length === 0 && (
                <li className="text-sm text-muted-foreground">Nothing matches that search.</li>
              )}
            </ul>

          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-12">
            <p className="label-mono text-xs text-muted-foreground">Rights</p>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{page.rights_statement}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
