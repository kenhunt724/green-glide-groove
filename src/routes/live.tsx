import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { OwncastPlayer } from "@/components/stream/owncast-player";
import { PeertubeLibrary } from "@/components/stream/peertube-library";

const TITLE = "Live & On-Demand | Earth Protection Society Broadcast";
const DESC =
  "Watch Earth Protection Society broadcasts live and browse the on-demand library — streamed from our own hardware, not a third-party platform.";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-7xl px-6 py-14">
        <p className="label-mono text-energy">Broadcast</p>
        <h1 className="mt-3 font-display text-4xl font-semibold">Live from the block</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Streamed straight from our own machine on our own connection. No platform sits between
          the work and the people watching it, and nothing here can be demonetised or taken down by
          somebody else.
        </p>

        <section className="mt-10">
          <OwncastPlayer />
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-semibold">On-demand library</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Past broadcasts, builds and field recordings. Everything is hosted on the same machine.
          </p>
          <div className="mt-6">
            <PeertubeLibrary />
          </div>
        </section>

        <p className="mt-14 text-sm text-muted-foreground">
          Playback trouble?{" "}
          <Link to="/status" className="text-signal underline underline-offset-4">
            Check live service status
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
