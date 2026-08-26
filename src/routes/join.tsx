import { useId, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  Loader2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { ContactPhone, CONTACT_PHONE } from "@/components/contact-phone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { submitTalentApplication, type TalentApplicationInput } from "@/lib/talent-applications.functions";
import { applicationRoles, linkedInCopy, roles } from "@/content/talent";

const TITLE = "Join the EPS Energy Corps | Earth Protection Society";
const DESC =
  "We are hiring certified battery and solar technicians, site evaluators, data-center energy engineers, and partnership leads in Atlanta. Customer-funded, locally owned, no outside investors.";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://earthresonancehub.com/join" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://earthresonancehub.com/join" }],
  }),
  component: JoinPage,
});

const icons = [MapPin, Briefcase, Users, Phone];

function JoinPage() {
  return (
    <div className="min-h-screen bg-obsidian text-foreground">
      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden="true"
            className="absolute -top-40 left-1/2 size-[46rem] -translate-x-1/2 rounded-full bg-energy/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-7xl px-5 py-24 md:py-32">
            <p className="label-mono text-energy">Careers & Community Technician Corps</p>
            <h1 className="mt-6 max-w-5xl text-4xl leading-[1.02] font-bold md:text-6xl lg:text-7xl">
              Build the sovereign power layer{" "}
              <span className="text-energy">with your own hands.</span>
            </h1>
            <p className="mt-8 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              {linkedInCopy.tagline} We are hiring locally for battery and solar technicians, site
              evaluators, data-center energy engineers, and partnership leads. Customer-funded. No
              outside investors. Every plant owned by the block.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#roles"
                className="inline-flex min-h-12 items-center gap-2 bg-energy px-7 font-display text-sm font-semibold text-background transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
              >
                See open roles <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`}
                className="inline-flex min-h-12 items-center gap-2 border border-border bg-surface px-7 font-display text-sm font-semibold transition-colors hover:border-energy hover:text-energy"
              >
                <Phone className="size-4" aria-hidden="true" />
                Call {CONTACT_PHONE}
              </a>
            </div>
            <div className="mt-5">
              <ContactPhone variant="energy" />
            </div>
          </div>
        </section>

        {/* Manifesto */}
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-px bg-border md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="bg-background p-7 md:p-10">
              <p className="label-mono text-energy">Why work here</p>
              <h2 className="mt-3 font-display text-2xl font-semibold md:text-3xl">
                A paycheck and a neighborhood asset.
              </h2>
            </div>
            <div className="bg-surface p-7 md:p-10">
              <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Most energy jobs ship the value out of town — to remote utilities, venture-backed
                startups, or leasing companies. At EPS the plant is owned by the site and the block
                that built it. The technician who commissions it is the same person who services it.
                The money stays local, the skills stay local, and the resilience stays local.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  {
                    t: "Customer-funded, no outside capital",
                    b: "Every project is paid for by the client, not a venture fund. No growth-at-all-costs pressure.",
                  },
                  {
                    t: "Community ownership",
                    b: "Land and equipment sit in a neighborhood-held entity. You are building an asset your own block owns.",
                  },
                  {
                    t: "Certified local technician corps",
                    b: "We train and certify locally. Your career ladder is built here, not imported.",
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

        {/* Roles */}
        <section id="roles" className="scroll-mt-20 border-b border-border">
          <div className="mx-auto max-w-7xl px-5 py-20 md:py-24">
            <p className="label-mono text-energy">Open roles</p>
            <h2 className="mt-3 max-w-3xl text-3xl font-bold md:text-5xl">
              Atlanta-first. Contract-to-W2 as the Block scales.
            </h2>
            <div className="mt-12 grid gap-px border border-border bg-border md:grid-cols-2">
              {roles.map((role, i) => {
                const Icon = icons[i] ?? Briefcase;
                return (
                  <article key={role.id} className="bg-background p-7">
                    <div className="flex items-center gap-3">
                      <Icon className="size-6 text-energy" aria-hidden="true" />
                      <span className="label-mono text-energy">{role.type}</span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-semibold">{role.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{role.pay}</p>
                    <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      {role.summary}
                    </p>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="label-mono text-xs uppercase">Must have</p>
                        <ul className="mt-2 space-y-2">
                          {role.mustHave.map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                              <span
                                aria-hidden="true"
                                className="mt-[7px] size-1 shrink-0 rounded-full bg-energy"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="label-mono text-xs uppercase">Nice to have</p>
                        <ul className="mt-2 space-y-2">
                          {role.niceToHave.map((item) => (
                            <li key={item} className="flex gap-2 text-sm text-muted-foreground">
                              <span
                                aria-hidden="true"
                                className="mt-[7px] size-1 shrink-0 rounded-full bg-emerald"
                              />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <a
                      href="#apply"
                      className="label-mono mt-6 inline-flex min-h-11 items-center text-energy transition-colors hover:text-energy/80 focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
                    >
                      Apply for this role <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                    </a>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Application form */}
        <section id="apply" className="scroll-mt-20 border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:py-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <p className="label-mono text-energy">Apply</p>
              <h2 className="mt-3 text-3xl font-bold md:text-5xl">Send your resume or LinkedIn</h2>
              <p className="mt-6 text-muted-foreground">
                We read every submission. If you do not see a perfect fit, apply anyway — we are
                building new benches as fast as the Block funds them.
              </p>
              <div className="mt-6">
                <ContactPhone variant="energy" />
              </div>
            </div>
            <ApplicationForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-display text-lg font-bold">EARTH PROTECTION SOCIETY</p>
            <p className="label-mono mt-2">Sovereign charter · Customer-funded · Locally owned</p>
            <div className="mt-3">
              <ContactPhone />
            </div>
          </div>
          <nav className="flex flex-wrap gap-6">
            <Link to="/energy" className="label-mono hover:text-signal">
              Energy
            </Link>
            <Link to="/about" className="label-mono hover:text-signal">
              About
            </Link>
            <Link to="/contact" className="label-mono hover:text-signal">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function ApplicationForm() {
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;
  const [form, setForm] = useState<TalentApplicationInput>({
    full_name: "",
    email: "",
    phone: "",
    role: applicationRoles[0],
    linkedin_url: "",
    resume_text: "",
    notes: "",
  });

  const submit = useServerFn(submitTalentApplication);
  const mutation = useMutation({
    mutationFn: submit,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (mutation.isSuccess) {
    return (
      <div className="border border-energy/30 bg-energy/10 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-energy" aria-hidden="true" />
        <h3 className="mt-4 font-display text-xl font-semibold">Application received</h3>
        <p className="mt-2 text-muted-foreground">
          We will review your details and reach out within two business days. If it is urgent, call{" "}
          <a href={`tel:${CONTACT_PHONE.replace(/-/g, "")}`} className="text-energy hover:underline">
            {CONTACT_PHONE}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fid("name")}>Full name</Label>
          <Input
            id={fid("name")}
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
            minLength={2}
            maxLength={120}
            className="border-border bg-surface"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={fid("email")}>Email</Label>
          <Input
            id={fid("email")}
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
            maxLength={200}
            className="border-border bg-surface"
          />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={fid("phone")}>Phone</Label>
          <Input
            id={fid("phone")}
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            maxLength={40}
            className="border-border bg-surface"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={fid("role")}>Role you are applying for</Label>
          <select
            id={fid("role")}
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            required
            className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none"
          >
            {applicationRoles.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fid("linkedin")}>LinkedIn profile URL</Label>
        <Input
          id={fid("linkedin")}
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={form.linkedin_url}
          onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
          maxLength={300}
          className="border-border bg-surface"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fid("resume")}>Resume / experience summary</Label>
        <Textarea
          id={fid("resume")}
          rows={6}
          value={form.resume_text}
          onChange={(e) => setForm((f) => ({ ...f, resume_text: e.target.value }))}
          maxLength={5000}
          placeholder="Paste your resume or a short summary of your relevant experience..."
          className="border-border bg-surface"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={fid("notes")}>Anything else we should know?</Label>
        <Textarea
          id={fid("notes")}
          rows={3}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          maxLength={1000}
          className="border-border bg-surface"
        />
      </div>

      {mutation.isError && (
        <p className="text-sm text-destructive">
          {mutation.error instanceof Error ? mutation.error.message : "Something went wrong."}
        </p>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="min-h-12 w-full bg-energy px-7 font-display text-sm font-semibold text-background hover:bg-energy/90 sm:w-auto"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />
            Sending...
          </>
        ) : (
          "Submit application"
        )}
      </Button>
    </form>
  );
}
