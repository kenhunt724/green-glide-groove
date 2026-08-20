import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CREATOR_KINDS, MASTER_EXTENSIONS } from "@/lib/creator-formats";
import { getCreatorProgramStatus } from "@/lib/creator.functions";

const statusQuery = queryOptions({
  queryKey: ["creator", "program-status"],
  queryFn: () => getCreatorProgramStatus(),
});

export const Route = createFileRoute("/creators")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statusQuery),
  errorComponent: () => (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl font-semibold">Creator program</h1>
      <p className="mt-3 text-muted-foreground">We could not load the cohort status. Try again shortly.</p>
    </main>
  ),
  notFoundComponent: () => (
    <main id="main" className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="font-display text-3xl font-semibold">Not found</h1>
    </main>
  ),
  component: CreatorsPage,
  head: () => ({
    meta: [
      { title: "Invite-Only Creator Program | Earth Protection Society" },
      {
        name: "description",
        content:
          "A limited cohort of Atlanta creators hosting uncompressed audio, video and art masters on their own page — invite only, creator-owned, exportable any time.",
      },
      { property: "og:title", content: "Invite-Only Creator Program | Earth Protection Society" },
      {
        property: "og:description",
        content: "Limited slots. Uncompressed masters. You keep every right to your work.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function CreatorsPage() {
  const { data: status } = useSuspenseQuery(statusQuery);

  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="mx-auto w-full max-w-5xl px-6 py-20">
          <p className="label-mono text-energy">Wing V / Creator vault</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold sm:text-5xl">
            Invite-only pages for uncompressed work
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            A small cohort of creators host their own page here: full-resolution audio, video and art masters,
            uploaded finished — we never edit, re-encode or claim your files.
          </p>

          <dl className="mt-10 grid gap-4 sm:grid-cols-3">
            <Stat label="Cohort size" value={String(status.maxSlots)} />
            <Stat label="Slots claimed" value={String(status.claimed)} />
            <Stat label="Slots left" value={String(status.remaining)} />
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/creator/dashboard"
              className="label-mono inline-flex min-h-11 items-center bg-energy px-6 font-semibold text-background transition-opacity hover:opacity-90"
            >
              Redeem an invite code
            </Link>
            <Link
              to="/community"
              className="label-mono inline-flex min-h-11 items-center border border-border px-6 transition-colors hover:border-energy hover:text-energy"
            >
              No invite? Join the trade pipeline
            </Link>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold">What you can upload</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-3">
              {CREATOR_KINDS.map((kind) => (
                <li key={kind.value} className="surface-panel p-6">
                  <p className="label-mono text-energy">{kind.label}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{kind.blurb}</p>
                  <p className="label-mono mt-4 text-xs text-muted-foreground">
                    .{MASTER_EXTENSIONS[kind.value].join(" · .")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-5xl px-6 py-16">
            <h2 className="font-display text-2xl font-semibold">How the ownership works</h2>
            <ul className="mt-8 grid gap-6 md:grid-cols-2">
              <Point title="You edit, then upload">
                Master your own files on your own machine. Nothing is processed or altered on our side.
              </Point>
              <Point title="Masters stay private">
                Full-resolution files sit in a private vault only you can reach. Public visitors only ever see the
                preview you choose to attach.
              </Point>
              <Point title="Export any time">
                One click gives you a manifest of your page plus download links for every master you uploaded.
              </Point>
              <Point title="Takedown without approval">
                One click unpublishes and permanently deletes your page and files. No staff review, no waiting.
              </Point>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-5">
      <dt className="label-mono text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-2 font-display text-3xl font-semibold text-energy">{value}</dd>
    </div>
  );
}

function Point({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="surface-panel p-6">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </li>
  );
}
