import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, BatteryCharging, Clock, Globe, Phone, Presentation, ShieldCheck, Sun, Wrench } from "lucide-react";
import { ContactPhone, CONTACT_PHONE } from "@/components/contact-phone";
import { DetachedVault } from "@/components/energy/detached-vault";
import { GridResilience } from "@/components/energy/grid-resilience";
import { MobileGenerators } from "@/components/energy/mobile-generators";
import { HydrogenStation } from "@/components/energy/hydrogen-station";
import { hydrogen } from "@/content/energy";
import podImg from "@/assets/home-power-pod.jpg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnergyNav } from "@/components/energy/energy-nav";
import { SavingsCalculator } from "@/components/energy/savings-calculator";
import { HardwareTiers } from "@/components/energy/hardware-tiers";
import { PlatformLadder } from "@/components/energy/platform-ladder";
import { LeadForm } from "@/components/energy/lead-form";
import { services, steps, trustBadges } from "@/content/energy";

const TITLE = "Electricity Power Harvesters | EPS Battery Vaults, Pods & Data Center BESS";
const DESC =
  "Silent generator carts, residential & commercial LiFePO4 power pods, and container battery plants that harvest cheap off-peak electricity for peak-hour use. Same-day site evaluations: 404-454-0602.";

export const Route = createFileRoute("/energy")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EnergyPage,
});

const stepIcons = [BatteryCharging, ShieldCheck, Sun];

function EnergyPage() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <EnergyNav onQuote={() => setQuoteOpen(true)} />

      <main id="main">
        {/* Hero */}
        <section className="rule-grid relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
            <p className="label-mono text-energy">Clean Energy &amp; Mobile Power Division</p>
            <h1 className="mt-6 max-w-5xl text-4xl leading-[1.02] font-bold md:text-6xl lg:text-7xl">
              Electricity Power Harvesters —{" "}
              <span className="text-energy">Cart, Pod &amp; Data-Center BESS.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              We engineer three LiFePO4 product lines that buy power when it is cheap and deliver it
              when it is expensive or unreliable: a rolling Mini-Micro Grid cart for jobsites and
              backup, a detached residential &amp; commercial power pod, and a container battery plant
              for data centers and commercial campuses. All charge overnight at ~2.3¢/kWh, run on
              batteries instead of the grid, and are built and serviced by certified local
              technicians.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {CONTACT_PHONE} — Same-day eval
              </a>
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex min-h-12 items-center gap-2 border border-emerald/60 bg-surface px-7 font-display text-sm font-semibold text-emerald transition-colors hover:bg-emerald/10"
              >
                Can&apos;t call? Send details
              </button>
              <Link
                to="/decks/data-center"
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                View the Data Center Pitch <Presentation className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/playbooks/commercial-bess"
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                Commercial BESS Playbook
              </Link>
            </div>
            <div className="mt-5">
              <ContactPhone variant="energy" />
            </div>

            <ul className="mt-14 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {trustBadges.map((b) => (
                <li key={b} className="flex items-center gap-3 bg-background p-5">
                  <ShieldCheck className="size-5 shrink-0 text-energy" aria-hidden="true" />
                  <span className="text-sm font-medium">{b}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Phone-first evaluation banner */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-5 py-8 md:flex-row md:items-center">
            <div>
              <p className="label-mono text-energy">Same-day site evaluation</p>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Residential, commercial, warehouse, and data-center sites. We review your interval
                data, roof or pad conditions, and tariff — then return an engineered savings figure.
              </p>
            </div>
            <a
              href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
              className="inline-flex min-h-12 shrink-0 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
            >
              <Phone className="size-4" aria-hidden="true" />
              Call {CONTACT_PHONE}
            </a>
          </div>
        </section>

        {/* Product ladder */}
        <section id="platforms" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">One architecture, four scales</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Cart, trailer, home pod, container
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              The same LiFePO4 bank, inverter stack and system control brain, packaged four ways — from
              a one-person cart to a container-scale plant.
            </p>
            <div className="mt-12">
              <PlatformLadder />
            </div>
          </div>
        </section>

        {/* Featured Power Pod hero */}
        <section className="rule-grid relative overflow-hidden border-b border-border bg-surface">
          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-0 size-[36rem] rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 py-20 md:py-28 lg:grid-cols-2 lg:gap-16">
            <div className="order-2 lg:order-1">
              <p className="label-mono text-energy">Residential &amp; Commercial Power Pod</p>
              <h2 className="mt-6 text-4xl leading-[1.05] font-bold md:text-5xl lg:text-6xl">
                Harvest electricity when it&apos;s cheapest.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Your power never flickers or goes out, because your house or business always runs on
                batteries, not the grid.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#platforms"
                  className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
                >
                  See the full platform <ArrowDown className="size-4" aria-hidden="true" />
                </a>
                <button
                  type="button"
                  onClick={() => setQuoteOpen(true)}
                  className="inline-flex min-h-12 items-center gap-2 border border-emerald/60 bg-surface px-7 font-display text-sm font-semibold text-emerald transition-colors hover:bg-emerald/10"
                >
                  Book a free site assessment
                </button>
              </div>
              <div className="mt-5">
                <ContactPhone variant="energy" />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <img
                src={podImg}
                alt="Detached home power pod with battery vault, inverters and rooftop solar"
                width={1536}
                height={1024}
                loading="lazy"
                className="aspect-[3/2] w-full border border-border object-cover"
              />
            </div>
          </div>
        </section>

        {/* Local clock control */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-px bg-border md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="bg-background p-7 md:p-10">
              <Clock className="size-6 text-energy" aria-hidden="true" />
              <p className="label-mono mt-6 text-energy">Local clock control</p>
              <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
                Set your own charging hours right on the unit.
              </h2>
            </div>
            <div className="bg-surface p-7 md:p-10">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                No app, no account, no one else touching your schedule. An air-gapped real-time
                clock lives inside the vault and schedules your charging locally — there is no
                cloud dependency, no utility access, and nothing a remote party can change, read or
                switch off. The decision of when you charge stays yours, even when the Wi-Fi goes
                down.
              </p>
            </div>
          </div>
        </section>


        {/* Data-center battery plant */}
        <section id="datacenter" className="rule-grid relative overflow-hidden border-b border-border bg-surface">
          <div
            aria-hidden="true"
            className="absolute -top-32 left-1/2 size-[38rem] -translate-x-1/2 rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Container Battery Plant · retrofit &amp; new-build playbook</p>
            <h2 className="mt-4 max-w-4xl text-3xl leading-[1.05] font-bold md:text-5xl">
              Batteries inside the container. No exhaust pipe. No engine. No fuel.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              A 20- or 40-foot intermodal container packed with racked LiFePO4 battery modules,
              industrial inverters and active thermal management. Not a generator. Not a diesel
              backup. A battery vault that drops onto an existing hall, warehouse, campus or
              brownfield, buys energy when the grid is quiet, discharges through peak windows to
              dodge demand charges, and rides through outages silently — no diesel, no fumes, no
              fuel deliveries, no substation queue. Owned and serviced locally, not leased back from
              a hyperscaler.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/decks/data-center"
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                Open the Pitch Deck <Presentation className="size-4" aria-hidden="true" />
              </Link>
              <a
                href="#platforms"
                className="inline-flex min-h-12 items-center gap-2 border border-emerald/60 bg-surface px-7 font-display text-sm font-semibold text-emerald transition-colors hover:bg-emerald/10"
              >
                View the Container Battery Plant <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                Plan a commercial site assessment
              </button>
            </div>
            <div className="mt-5">
              <ContactPhone variant="energy" />
            </div>
          </div>
        </section>

        {/* Edge compute: local power frees compute from the feeder */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-16 md:py-20">
            <div className="grid gap-px bg-border md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
              <div className="bg-background p-7 md:p-10">
                <p className="label-mono text-energy">Edge compute deployment</p>
                <h2 className="mt-3 max-w-md text-3xl leading-[1.05] font-bold md:text-4xl">
                  Retrofit first. Own it locally. Serve the load where it lives.
                </h2>
              </div>
              <div className="bg-surface p-7 md:p-10">
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  The only thing tying compute to a giant centralized facility was the grid — and
                  the megawatt feeder it demanded. Once power lives in a local battery plant, that
                  constraint disappears. You can stand up racks wherever the load actually is — a
                  neighborhood, a campus, a partner&apos;s floor, a brownfield site — and serve users
                  from the edge of their own town instead of from a distant regional hub.
                </p>
                <ul className="mt-8 space-y-4">
                  {[
                    {
                      t: "A repeatable retrofit method",
                      b: "Same container plant, same commissioning steps, dropped onto buildings that already exist. No new substation, no megawatt feeder, no multi-year interconnection queue.",
                    },
                    {
                      t: "Edge economics",
                      b: "Off-peak energy bought at ~2.3¢/kWh plus no transmission build-out, no demand charges, no new substation wait.",
                    },
                    {
                      t: "Locally owned, locally serviced",
                      b: "The plant is owned by the site and maintained by certified technicians from the block — compute capacity that keeps its money in the neighborhood.",
                    },
                    {
                      t: "Sovereign isolation",
                      b: "Each edge site carries its own clean silent ride-through. One outage at the core no longer takes down the network.",
                    },
                  ].map((p) => (

                    <li key={p.t} className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className="mt-[7px] size-1 shrink-0 rounded-full bg-energy"
                      />
                      <div>
                        <h3 className="font-display text-sm font-semibold">{p.t}</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.b}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Locally owned ownership model */}
        <section className="rule-grid border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">The ownership model</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-[1.05] font-bold md:text-5xl">
              The client funds the build. The block owns what gets built.
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              A vault on your site is not something you rent or lease back. Your money pays for
              the plant once — the batteries, the inverters, the land it sits on — and what is
              built stays owned by the neighbourhood that built it.
            </p>
            <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-3">
              <div className="bg-background p-7">
                <p className="label-mono text-energy">01 · Paid for once</p>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  Customer-funded capacity
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  The build is paid for upfront by the site it serves. In return the site holds
                  its own power and compute capacity — an asset it owns, not a service contract.
                </p>
              </div>
              <div className="bg-background p-7">
                <p className="label-mono text-energy">02 · Kept close</p>
                <h3 className="mt-3 font-display text-xl font-semibold">Owned by the block</h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Land and equipment sit in a community-held entity. The people where it is
                  installed own the plant and its earnings, and no outside interest holds a stake.
                </p>
              </div>
              <div className="bg-background p-7">
                <p className="label-mono text-energy">03 · Maintained locally</p>
                <h3 className="mt-3 font-display text-xl font-semibold">
                  Serviced by local technicians
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  Certified technicians from the block build, commission and service every plant.
                  The jobs and the money stay in the neighbourhood.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Global sourcing, local build */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-px bg-border md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
            <div className="bg-background p-7 md:p-10">
              <Globe className="size-6 text-energy" aria-hidden="true" />
              <p className="label-mono mt-6 text-energy">Global sourcing, local build</p>
              <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
                A worldwide parts map protects the neighborhood.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                We source the best cells, inverters and switchgear from wherever they are made best —
                and we build, own and service every plant right here on the block.
              </p>
            </div>
            <div className="bg-surface p-7 md:p-10">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                A global mindset is not about shipping jobs overseas. It is about resilience: even
                American suppliers face strikes, bankruptcies, fires and tariff shocks. By qualifying
                multiple cell and inverter sources across continents, we make sure one supplier&apos;s
                shutdown never shuts down a community&apos;s power plant. The jobs stay local. The
                ownership stays local. The parts map stays diversified.
              </p>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    t: "No single point of failure",
                    b: "Cells, inverters and switchgear sourced from qualified vendors in multiple regions.",
                  },
                  {
                    t: "Local assembly & service",
                    b: "Vaults, pods and containers are welded, wired and commissioned by certified block technicians.",
                  },
                  {
                    t: "Supplier shocks never strand projects",
                    b: "If one region or factory goes offline, alternate parts keep builds on schedule.",
                  },
                  {
                    t: "Community keeps the equity",
                    b: "Global sourcing lowers capex; local build and ownership keep the value in the neighborhood.",
                  },
                ].map((p) => (
                  <li key={p.t} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] size-1 shrink-0 rounded-full bg-energy"
                    />
                    <div>
                      <h3 className="font-display text-sm font-semibold">{p.t}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{p.b}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Grid resilience */}
        <section id="resilience" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <GridResilience />
          </div>
        </section>

        {/* Detached outbuilding vaults */}
        <section id="vaults" className="scroll-mt-20 border-b border-border">

          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Standard installation model</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Detached outbuilding power vaults
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              High-voltage storage, inverters and cooling live in a dedicated exterior pod — faster
              permitting, zero living-space intrusion, and service without disturbing occupants.
            </p>
            <div className="mt-12">
              <DetachedVault />
            </div>
          </div>
        </section>

        {/* Mobile silent generators */}
        <section id="mobile" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-emerald">Gas generator replacement</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Mobile silent LiFePO4 generators
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Community-built heavy-duty power stations for jobsites, emergency backup, food trucks
              and events — charged three ways, with no fumes and no noise.
            </p>
            <div className="mt-12">
              <MobileGenerators />
            </div>
          </div>
        </section>

        {/* On-demand hydrogen */}
        <section id="hydrogen" className="scroll-mt-20 border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">{hydrogen.eyebrow}</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">{hydrogen.headline}</h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">{hydrogen.lede}</p>
            <div className="mt-12">
              <HydrogenStation />
            </div>
          </div>
        </section>

        {/* Calculator */}
        <section id="calculator" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Rate arbitrage model</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Interactive savings calculator
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              Move the sliders to see your tiered utility bill against a super-off-peak battery
              arbitrage plus zero-export solar pairing.
            </p>
            <div className="mt-12">
              <SavingsCalculator />
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="why-off-peak" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">The closed-loop system</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Why off-peak wins, in three moves
            </h2>
            <div className="mt-12 grid gap-px bg-border lg:grid-cols-3">
              {steps.map((s, i) => {
                const Icon = stepIcons[i] ?? BatteryCharging;
                return (
                  <article key={s.id} className="bg-background p-7">
                    <div className="flex items-center justify-between">
                      <Icon className="size-6 text-energy" aria-hidden="true" />
                      <span className="font-display text-4xl font-bold text-border">{s.step}</span>
                    </div>
                    <p className="label-mono mt-6 text-energy">{s.window}</p>
                    <h3 className="mt-2 font-display text-xl font-semibold">{s.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Hardware */}
        <section id="hardware" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Modular hardware</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Pick the control surface your building deserves
            </h2>
            <div className="mt-10">
              <HardwareTiers />
            </div>
          </div>
        </section>

        {/* Services */}
        <section id="maintenance" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Turnkey services</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Engineered, installed and maintained by the block
            </h2>
            <div className="mt-12 grid gap-px bg-border lg:grid-cols-3">
              {services.map((s) => (
                <article key={s.id} className="bg-background p-7">
                  <Wrench className="size-6 text-energy" aria-hidden="true" />
                  <h3 className="mt-6 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  <ul className="mt-6 space-y-2">
                    {s.points.map((p) => (
                      <li key={p} className="flex gap-2 text-sm text-muted-foreground">
                        <span
                          aria-hidden="true"
                          className="mt-[7px] size-1 shrink-0 rounded-full bg-energy"
                        />
                        {p}
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Booking */}
        <section id="book" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <p className="label-mono text-energy">Can&apos;t call right now?</p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Send your details and we will call you back
              </h2>
              <p className="mt-6 text-muted-foreground">
                Four short steps. A local certified technician pulls twelve months of your interval
                data, models your tariff, and returns an engineered savings figure — no obligation,
                no sales theatre. Prefer speed? Call 404-454-0602.
              </p>
              <div className="mt-6">
                <ContactPhone variant="energy" />
              </div>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      {/* Sticky mobile call button */}
      <a
        href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
        className="fixed right-4 bottom-24 z-40 flex h-14 items-center gap-2 rounded-full bg-energy px-5 font-display text-sm font-semibold text-background shadow-lg transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none md:hidden"
        aria-label="Call Earth Protection Society Energy Division"
      >
        <Phone className="size-5" aria-hidden="true" />
        {CONTACT_PHONE}
      </a>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">
              EARTH PROTECTION SOCIETY · ENERGY DIVISION
            </p>
            <p className="label-mono mt-2">
              Block 12 · Sovereign charter · Locally controlled architecture
            </p>
          </div>
          <nav className="flex flex-wrap gap-6" aria-label="Footer">
            <Link to="/" className="label-mono hover:text-energy">
              Home
            </Link>
            <Link to="/store" className="label-mono hover:text-energy">
              Master Vaults
            </Link>
            <Link to="/mobility" className="label-mono hover:text-energy">
              Hybrid Fleet
            </Link>
            <Link to="/about" className="label-mono hover:text-energy">
              Community Hub
            </Link>
          </nav>
        </div>
      </footer>

      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Send your details</DialogTitle>
            <DialogDescription>
              We will call you back to schedule a site evaluation. For fastest response, call{" "}
              <a href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`} className="text-energy hover:underline">
                {CONTACT_PHONE}
              </a>
              .
            </DialogDescription>
          </DialogHeader>
          <LeadForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
