# LinkedIn + Energy Page + Talent Push

A focused pass to turn the Energy wing into a site-evaluation and talent-recruitment engine, with LinkedIn-ready copy and an on-site mirror page.

## 1. LinkedIn presence package

**LinkedIn copy drafts**
- Company/tagline headline (60 chars or less).
- About section (2,600-char LinkedIn limit) emphasizing sovereign ownership, customer-funded capex, and the retrofit data-center playbook.
- 3 ready-to-post updates:
  1. The site-evaluation push (phone-first CTA).
  2. The "Harvester" product ladder (cart → pod → container).
  3. Hiring call for certified technicians and site evaluators.

**On-site mirror page** — new route `/join` (or `/careers` if preferred)
- Hero with the same headline as LinkedIn.
- Short manifesto block.
- Open roles cards.
- Resume / LinkedIn profile submission form (name, email, role, LinkedIn URL, resume file or paste).
- Contact phone and site-evaluation CTA.

## 2. Energy page refocus

- Reorder the hero value prop to lead with the three commercial priorities: **Silent Generator Cart**, **Residential & Commercial Power Pod**, **Container Energy Plant / Data Center BESS**.
- Add a phone-first evaluation CTA block near the top: "Call 404-454-0602 for a same-day site evaluation."
- Add a sticky mobile call button.
- Tighten the lead form so it feels like the "schedule a call-back" path, not the primary path.
- Keep the calculator, how-it-works, and hardware tiers but move them below the product priorities.

## 3. Talent / open roles

Create role cards for:
- **Site Evaluator / Field Assessor** — residential & commercial energy audits, roof/utility interconnection pre-checks.
- **Certified Battery & Solar Technician** — Victron/Cerbo GX commissioning, LiFePO4 installs, local maintenance.
- **Data Center Energy Engineer** — container plant sizing, peak-shaving economics, edge compute deployments.
- **Business Development — Partnerships & JVs** — land owners, installers, data-center operators.

Each card: title, location type (Atlanta-first, remote/hybrid for some), pay model (contract → W2 as Block scales), and a direct "Apply" link to the submission form.

## 4. Site evaluation phone-first flow

- Promote `404-454-0602` to primary CTA on `/energy` hero and product sections.
- Add a click-to-call button fixed to bottom-right on mobile.
- Keep the existing lead form but label it "Can’t call? Send your details and we’ll call you."
- Add a short evaluation-pricing teaser (free 15-min phone screen; paid on-site tiers for commercial/data-center).

## 5. SEO / metadata

- Update `/energy` head with keywords: off-peak battery, LiFePO4 power pod, silent generator cart, data center BESS, site evaluation Atlanta.
- Add unique head to new `/join` route.
- Add `/join` link to site footer and energy nav drawer.

## Deliverables

- `src/routes/join.tsx` — talent landing page.
- `src/content/talent.ts` — role definitions and LinkedIn copy.
- Updated `src/routes/energy.tsx` — refocused product priorities + phone-first CTAs.
- Updated `src/components/site-footer.tsx` and `src/components/energy/energy-nav.tsx` — `/join` links.
- A markdown document with the LinkedIn copy drafts ready to paste.
