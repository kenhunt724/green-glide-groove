import { createFileRoute } from "@tanstack/react-router";
import { Mail, Phone } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ContactPhone } from "@/components/contact-phone";

export const CONTACT_EMAIL = "eps724@outlook.com";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Earth Protection Society" },
      {
        name: "description",
        content:
          "Call or email Earth Protection Society to discuss data-center joint ventures, energy assessments, ultra-streaming partnerships, or technician apprenticeships.",
      },
      { property: "og:title", content: "Contact Earth Protection Society" },
      {
        property: "og:description",
        content:
          "Customer-funded, locally owned, no outside capital. Start the conversation by phone or email.",
      },
    ],
  }),
  component: ContactPage,
});

const reasons = [
  {
    title: "Data-center joint venture",
    body: "Retrofit an existing building or new-build edge compute site with a battery plant owned by the site and serviced by the block.",
  },
  {
    title: "Energy assessment",
    body: "Size a cart, trailer, power pod, or container plant for your home, business, campus, or facility.",
  },
  {
    title: "Ultra-Streaming partnership",
    body: "Open a consignment storefront for uncompressed 432Hz masters and keep ownership with the artists.",
  },
  {
    title: "Technician apprenticeship",
    body: "Train on battery plants, e-axle gliders, and closed-loop building systems with local mentors.",
  },
];

function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main id="main">
        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-28">
            <p className="label-mono">Get in touch</p>
            <h1 className="mt-5 max-w-4xl text-4xl font-bold md:text-6xl">
              Start the <span className="text-signal">conversation.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">
              Every project starts with a phone call or an email. Tell us what you are building,
              and we will tell you honestly whether the block can help.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
              <a
                href={`tel:${"404-454-0602".replace(/-/g, "")}`}
                className="surface-panel flex items-center gap-4 p-6 transition-colors hover:border-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
              >
                <Phone className="size-6 text-signal" aria-hidden="true" />
                <div>
                  <p className="label-mono text-xs uppercase tracking-wider text-muted-foreground">Phone / text</p>
                  <p className="mt-1 font-display text-xl font-semibold">404-454-0602</p>
                </div>
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="surface-panel flex items-center gap-4 p-6 transition-colors hover:border-signal focus-visible:ring-2 focus-visible:ring-signal focus-visible:outline-none"
              >
                <Mail className="size-6 text-signal" aria-hidden="true" />
                <div>
                  <p className="label-mono text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                  <p className="mt-1 font-display text-xl font-semibold break-all">{CONTACT_EMAIL}</p>
                </div>
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <h2 className="text-2xl font-semibold md:text-3xl">What are you reaching out about?</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {reasons.map((r) => (
                <div
                  key={r.title}
                  className="border border-border bg-background p-6 transition-colors hover:border-signal"
                >
                  <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-16">
            <h2 className="text-2xl font-semibold md:text-3xl">How we work</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                "Customer-funded — no outside capital",
                "Locally owned by the site or block",
                "Serviced by certified neighbourhood technicians",
                "Air-gapped controls, no cloud dependency",
              ].map((item) => (
                <li key={item} className="flex gap-3 border-t border-border pt-4 text-sm">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                  <span className="leading-relaxed text-muted-foreground">{item}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10">
              <ContactPhone variant="signal" />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
