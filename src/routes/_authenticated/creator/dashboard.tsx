import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CreatorDashboard } from "@/components/creator/creator-dashboard";

export const Route = createFileRoute("/_authenticated/creator/dashboard")({
  component: CreatorDashboardPage,
  head: () => ({
    meta: [
      { title: "Creator Studio | Earth Protection Society" },
      {
        name: "description",
        content:
          "Invite-only creator studio: claim your page, upload uncompressed audio, video and art masters, and keep full ownership of your work.",
      },
      { property: "og:title", content: "Creator Studio | Earth Protection Society" },
      {
        property: "og:description",
        content: "Claim your invite, upload uncompressed masters, and keep ownership of everything you make.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function CreatorDashboardPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-4xl px-6 py-16">
        <p className="label-mono text-energy">Creator studio</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Your work, your terms</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Upload finished, uncompressed masters. Nothing is edited or re-encoded by us, and you can export or
          delete everything at any time.
        </p>
        <div className="mt-12">
          <CreatorDashboard />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
