import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import gliderTruck from "@/assets/glider-truck.jpg";

export const Route = createFileRoute("/mobility")({
  head: () => ({
    meta: [
      { title: "Series-Hybrid Glider Trucks — Earth Protection Society" },
      {
        name: "description",
        content:
          "Community-built series-hybrid flex-fuel glider trucks running Brogen e-axles and LiFePO4 battery buffers, serviced by local technicians.",
      },
      { property: "og:title", content: "Industrial Mobility — Glider Trucks" },
      {
        property: "og:description",
        content: "Brogen e-axles, LiFePO4 buffers, flex-fuel range extender, open service manuals.",
      },
    ],
  }),
  component: MobilityPage,
});

const spec = [
  { label: "Drive", value: "Brogen 2-speed e-axle, 350 kW peak" },
  { label: "Buffer", value: "84 kWh LiFePO4, liquid-conditioned" },
  { label: "Range extender", value: "2.0L flex-fuel genset, E85 / biogas" },
  { label: "Architecture", value: "Series hybrid — no mechanical path to the wheels" },
  { label: "Glider mass", value: "4,180 kg with body-in-white aluminium" },
  { label: "Drag", value: "Cd 0.28 with boat-tail and skirt package" },
  { label: "Plug-in range", value: "192 km battery-only, urban duty cycle" },
  { label: "Service", value: "Open manuals, standard tooling, local rebuild" },
];

const buildStages = [
  {
    step: "01",
    title: "Glider intake",
    body: "Cab-and-frame gliders arrive without powertrain. We survey the rails, strip the harness, and log every component into the shared ledger.",
  },
  {
    step: "02",
    title: "E-axle fitment",
    body: "The Brogen e-axle drops into a purpose-built subframe. High-voltage routing is done by certified apprentices under a licensed supervisor.",
  },
  {
    step: "03",
    title: "Buffer & genset",
    body: "LiFePO4 modules are stacked into a crash-braced tunnel pack. The flex-fuel genset runs only as a charger, at a single efficient load point.",
  },
  {
    step: "04",
    title: "Commission & hand-off",
    body: "Dyno verification, thermal soak, and a two-day operator course. The truck leaves with its own service manual and parts list.",
  },
];

function MobilityPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="label-mono">Wing II · Industrial Mobility</p>
            <h1 className="mt-5 text-4xl font-bold md:text-6xl">
              Series-hybrid flex-fuel <span className="text-signal">glider trucks</span>, built by
              the block that drives them.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              No mechanical driveline. A Brogen e-axle does all the work, a LiFePO4 buffer absorbs
              the duty cycle, and a small flex-fuel genset holds state of charge on long hauls.
            </p>
          </div>
          <img
            src={gliderTruck}
            alt="Community-built aerodynamic series-hybrid glider truck in a dark studio"
            width={1600}
            height={1008}
            className="w-full border border-border object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <h2 className="text-2xl font-semibold">Platform specification</h2>
        <dl className="mt-8 grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
          {spec.map((s) => (
            <div key={s.label} className="bg-background p-6">
              <dt className="label-mono">{s.label}</dt>
              <dd className="mt-3 text-base leading-snug">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16">
          <h2 className="text-2xl font-semibold">Build sequence</h2>
          <div className="mt-10 grid gap-px bg-border md:grid-cols-2 xl:grid-cols-4">
            {buildStages.map((b) => (
              <div key={b.step} className="bg-surface p-6">
                <span className="font-display text-3xl font-bold text-signal">{b.step}</span>
                <h3 className="mt-4 text-lg font-semibold">{b.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16">
        <div className="surface-panel p-8 md:p-12">
          <h2 className="text-2xl font-semibold">Why series, why flex-fuel</h2>
          <div className="mt-6 grid gap-8 md:grid-cols-3">
            <p className="text-sm leading-relaxed text-muted-foreground">
              A series layout lets the engine ignore the road entirely. It runs at one load point or
              not at all, which is where a small combustion unit is actually efficient.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Flex-fuel means the truck accepts what the district can produce — ethanol from
              regional stock, biogas from the digesters, petrol only as a fallback.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              LiFePO4 carries the duty cycle without cobalt, tolerates deep cycling, and retires
              into the campus UPS bank when it drops below traction spec.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
