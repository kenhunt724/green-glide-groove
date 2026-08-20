import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CommunityIntake } from "@/components/community/community-intake";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Trade Pipeline — Skill Into Wealth Where We Are" },
      {
        name: "description",
        content:
          "Apprentice with the crew or register your local shop as a fabrication partner. We build carts, power pods and battery vaults in neighborhood shops and pay the block that builds them.",
      },
      { property: "og:title", content: "Earth Protection Society — Trade Pipeline" },
      {
        property: "og:description",
        content:
          "Learn a trade or put your shop's bench to work building carts, power pods and battery vaults for buyers outside the neighborhood.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityPage,
});

const pillars = [
  {
    label: "01",
    title: "The work stays here",
    body: "Carts, power pods and battery vaults are fabricated and assembled in shops on our own blocks — not shipped in from a contract plant three states away.",
  },
  {
    label: "02",
    title: "The skill compounds",
    body: "Apprentices learn on live jobs: welding and frame work, LiFePO4 pack assembly, DC wiring, commissioning and service. Each finished unit trains the next hand.",
  },
  {
    label: "03",
    title: "The market is outside",
    body: "Product and service get exported to buyers who cannot source a silent, community-built power pod anywhere else. Revenue enters the block instead of leaving it.",
  },
];

const tracks = [
  {
    title: "Fabrication",
    body: "Frames, enclosures, cart bodies. Cut, weld, finish. Runs out of partner shops with existing benches.",
  },
  {
    title: "Pack assembly",
    body: "LiFePO4 module build-up, BMS wiring, enclosure integration, load testing before a unit ever leaves.",
  },
  {
    title: "Install & commissioning",
    body: "Detached vault sets, sub-panel work, Cerbo/Ekrano configuration, handover walkthrough with the owner.",
  },
  {
    title: "Service & monitoring",
    body: "Firmware audits, battery health checks, on-site swaps. The recurring side of the trade, and the steadiest pay.",
  },
];

function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20">
            <p className="label-mono">Wing IV · The Pipeline</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold md:text-6xl">
              Turning skill into wealth <span className="text-signal">from where we are</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Two channels, one loop. Inward: we train hands and put neighborhood shops on the
              build. Outward: what those shops make gets sold to people who cannot find it
              anywhere else. This page is the inward door.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.label}>
                <p className="label-mono text-signal">{p.label}</p>
                <h2 className="mt-3 text-xl font-bold">{p.title}</h2>
                <p className="mt-3 text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <h2 className="text-3xl font-bold">Trade tracks</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              You do not need experience to start. You need to show up on a build day.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tracks.map((t) => (
                <div key={t.title} className="rounded-lg border border-border bg-surface p-6">
                  <h3 className="font-display text-lg font-bold">{t.title}</h3>
                  <p className="mt-3 text-sm text-muted-foreground">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <h2 className="text-3xl font-bold">Shop partners</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              If you own a shop with a bench, a welder, a paint booth or a lift, that capacity is
              the constraint on how much we can build. We route work to partner shops by job type
              and pay per unit delivered, and every job carries an apprentice.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-5 py-16">
            <h2 className="text-3xl font-bold">Get on the board</h2>
            <p className="mt-3 text-muted-foreground">
              Tell us which side you&apos;re coming in on and a crew lead will follow up.
            </p>
            <div className="mt-8">
              <CommunityIntake />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
