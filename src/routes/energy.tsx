import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, BatteryCharging, ShieldCheck, Sun, Wrench } from "lucide-react";
import { DetachedVault } from "@/components/energy/detached-vault";
import { MobileGenerators } from "@/components/energy/mobile-generators";
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

const TITLE = "Battery Vaults & Silent Mobile Generators | EPS Clean Energy";
const DESC =
  "Detached outbuilding LiFePO4 battery vaults that cut peak utility rates up to 90%, plus silent mobile generators that replace gas engines. Charge at ~2.3¢/kWh, from solar, or off your alternator.";

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
              Sovereign Power for Your Property &amp; On the Move —
              <span className="text-energy"> Zero Fumes, Zero Noise, Zero Peak Rates.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              We engineer detached outbuilding battery vaults that slash peak utility rates by up to
              90%, plus silent mobile LiFePO4 generators that replace dangerous gas engines. Charge
              overnight at ~2.3¢/kWh, from rooftop solar, or directly from your vehicle&apos;s
              alternator while you drive.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#vaults"
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                Explore Stationary Energy Vaults <ArrowDown className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#mobile"
                className="inline-flex min-h-12 items-center gap-2 border border-emerald/60 bg-surface px-7 font-display text-sm font-semibold text-emerald transition-colors hover:bg-emerald/10"
              >
                View Mobile Silent Generators
              </a>
              <button
                type="button"
                onClick={() => setQuoteOpen(true)}
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                Book a Free Site Assessment
              </button>
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

        {/* Product ladder */}
        <section id="platforms" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">One architecture, four scales</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Cart, trailer, home pod, container
            </h2>
            <p className="mt-5 max-w-2xl text-muted-foreground">
              The same LiFePO4 bank, inverter stack and Victron GX brain, packaged four ways — from
              a one-person cart to a container-scale plant.
            </p>
            <div className="mt-12">
              <PlatformLadder />
            </div>
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
              <p className="label-mono text-energy">Free site assessment</p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">
                Book your engineered savings review
              </h2>
              <p className="mt-6 text-muted-foreground">
                Four short steps. A local certified technician pulls twelve months of your interval
                data, models your tariff, and returns a binding vault design — no obligation, no
                sales theatre.
              </p>
            </div>
            <LeadForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">
              EARTH PROTECTION SOCIETY · ENERGY DIVISION
            </p>
            <p className="label-mono mt-2">
              Block 12 · Sovereign charter · Victron authorized architecture
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
            <DialogTitle className="font-display text-2xl">Book a free site assessment</DialogTitle>
            <DialogDescription>
              Four steps, about ninety seconds. We come back with an engineered savings figure.
            </DialogDescription>
          </DialogHeader>
          <LeadForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
