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
  if (!data) return null;
  const { page, items } = data;

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
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              {items.map((item) => (
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
