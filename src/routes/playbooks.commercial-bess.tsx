import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, ArrowLeft, CheckCircle2, Globe, Wrench, TrendingUp, Megaphone, Container, BatteryCharging, Download } from "lucide-react";
import { ContactPhone, CONTACT_PHONE } from "@/components/contact-phone";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { commercialBessPlaybook as playbook } from "@/content/playbooks";

const TITLE = "Commercial BESS Deployment Playbook | Earth Protection Society";
const DESC =
  "Operational blueprint for turnkey, customer-funded battery energy storage deployments. Marketing, supply chain, and contractor partnership framework — no outside capital, locally owned.";

export const Route = createFileRoute("/playbooks/commercial-bess")({
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
  component: CommercialBessPlaybookPage,
});

const pillarIcons: Record<string, typeof TrendingUp> = {
  financial: TrendingUp,
  "supply-chain": Globe,
  contractors: Wrench,
  marketing: Megaphone,
};

function PillarIcon({ id }: { id: string }) {
  const Icon = pillarIcons[id] ?? CheckCircle2;
  return <Icon className="size-6 text-energy" aria-hidden="true" />;
}

function CommercialBessPlaybookPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="rule-grid relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
            <Link
              to="/energy"
              className="label-mono inline-flex items-center gap-2 text-energy transition-opacity hover:opacity-80"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to Energy Division
            </Link>

            <p className="label-mono mt-8 text-energy">Earth Protection Society · Energy Division</p>
            <h1 className="mt-6 max-w-5xl text-4xl leading-[1.02] font-bold md:text-6xl lg:text-7xl">
              {playbook.title}
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-muted-foreground md:text-2xl">
              {playbook.subtitle}
            </p>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {playbook.lede}
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {CONTACT_PHONE} — Same-day eval
              </a>
              <a
                href="/eps-commercial-bess-playbook.pdf"
                download
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                <Download className="size-4" aria-hidden="true" />
                Download PDF
              </a>
              <Link
                to="/decks/data-center"
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                View the Data Center Pitch
              </Link>
            </div>
            <div className="mt-5">
              <ContactPhone variant="energy" />
            </div>
          </div>
        </section>

        {/* Executive summary */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Executive summary</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-[1.05] font-bold md:text-5xl">
              The EPS operating method
            </h2>
            <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2">
              {playbook.executiveSummary.map((item) => (
                <div key={item.id} className="bg-surface p-8">
                  <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic pillars */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Strategic pillars</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-[1.05] font-bold md:text-5xl">
              Marketing, supply chain, and contractor partnerships
            </h2>

            <div className="mt-14 space-y-8">
              {playbook.pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="grid gap-px overflow-hidden border border-border bg-border lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]"
                >
                  <div className="bg-background p-8">
                    <PillarIcon id={pillar.id} />
                    <p className="label-mono mt-6 text-energy">{pillar.kicker}</p>
                    <h3 className="mt-3 font-display text-2xl font-semibold text-white md:text-3xl">
                      {pillar.title}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                      {pillar.body}
                    </p>
                  </div>
                  <div className="bg-surface p-8">
                    <ul className="space-y-6">
                      {pillar.points.map((point) => (
                        <li key={point.title} className="flex gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] size-1.5 shrink-0 rounded-full bg-energy"
                          />
                          <div>
                            <h4 className="font-display text-sm font-semibold text-foreground">
                              {point.title}
                            </h4>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {point.body}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Deployment phases */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Deployment timeline</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-[1.05] font-bold md:text-5xl">
              From site assessment to commissioned plant in ten weeks
            </h2>
            <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-4">
              {playbook.phases.map((p) => (
                <div key={p.phase} className="bg-surface p-8">
                  <p className="label-mono text-energy">{p.phase}</p>
                  <p className="mt-2 font-display text-sm font-semibold text-muted-foreground">
                    {p.weeks}
                  </p>
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">{p.title}</h3>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product fit */}
        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">{playbook.productFit.kicker}</p>
            <h2 className="mt-4 max-w-3xl text-3xl leading-[1.05] font-bold md:text-5xl">
              {playbook.productFit.title}
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {playbook.productFit.body}
            </p>

            <div className="mt-14 grid gap-px border border-border bg-border md:grid-cols-3">
              {playbook.productFit.products.map((product) => {
                const Icon =
                  product.id === "cart"
                    ? BatteryCharging
                    : product.id === "pod"
                      ? CheckCircle2
                      : Container;
                return (
                  <div key={product.id} className="bg-background p-8">
                    <Icon className="size-6 text-energy" aria-hidden="true" />
                    <p className="label-mono mt-6 text-energy">{product.scale}</p>
                    <h3 className="mt-3 font-display text-xl font-semibold text-white">
                      {product.name}
                    </h3>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {product.fit}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="rule-grid relative overflow-hidden border-b border-border bg-obsidian">
          <div
            aria-hidden="true"
            className="absolute -bottom-32 right-0 size-[36rem] rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-24 text-center md:py-32">
            <p className="label-mono text-energy">Next step</p>
            <h2 className="mt-6 text-4xl leading-[1.05] font-bold md:text-5xl lg:text-6xl">
              {playbook.cta.title}
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              {playbook.cta.body}
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <a
                href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {CONTACT_PHONE}
              </a>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                Send details instead
              </Link>
            </div>
            <div className="mt-5 flex justify-center">
              <ContactPhone variant="dark" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
