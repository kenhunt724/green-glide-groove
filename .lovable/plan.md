# Energy Division Landing Page

A new marketing wing for Earth Protection Society: a conversion-focused landing page for residential & commercial off-peak battery + solar systems, at `/energy`.

## What gets built

**Hero**
- Headline "Slash Your Peak Power Rates by Up to 90% Without Changing Your Lifestyle." with the Georgia Power / ~2.3¢ overnight sub-headline.
- Primary "Book a Free Site Assessment" (opens the multi-step lead modal) and secondary "Calculate Your Savings" (scrolls to calculator).
- Four trust badges: LEED Platinum Standards, Victron Energy Authorized Architecture, Community Trained Technicians, Complete Grid Independence Ready.

**Rate arbitrage calculator**
- Sliders: monthly bill ($100–$800+) and square footage.
- Side-by-side bar comparison of a standard tiered utility bill vs. off-peak arbitrage + zero-export solar.
- Live readouts: estimated monthly savings, peak demand reduction in kW, 10-year retained equity.

**How it works** — three steps: super off-peak charging (11 PM–7 AM), peak-hour load defection (2 PM–7 PM), zero-export solar capture.

**Hardware tiers** — Stealth Industrial Node (Cerbo GX headless), Modular Living-Space Console (Cerbo GX + 5"/7" GX Touch), Executive Touch Command Hub (Ekrano GX). Toggle switches between card view and a spec comparison table covering processing, air-gapped local clock control, and offline reliability.

**Turnkey services** — engineering & permitting, certified rooftop solar integration, lifetime monitoring & community maintenance tiers.

**Lead capture** — 4-step form in a dialog (also embedded inline near the bottom): contact + zip, property type, bill range + roof condition, preferred consultation time. Progress indicator, per-step validation, confirmation state.

**Navigation** — page-level sticky nav with logo, Why Off-Peak?, Hardware, Calculator, Maintenance, and a Get Quote CTA; slide-out drawer linking to the existing EPS wings (Ultra-Streaming store, Mobility fleet, Community hub/About).

## Data storage

Leads are stored in Lovable Cloud (enabled as part of this work): an `energy_leads` table capturing contact info, zip, property type, bill range, roof condition, and preferred time. Insert-only from the public site; no public read access, so submitted leads stay private. Submission goes through a server function with validation.

## Technical notes

- New routes: `src/routes/energy.tsx` (page) plus section components under `src/components/energy/` (hero, calculator, how-it-works, hardware-tiers, services, lead-form, energy-nav).
- Uses existing shadcn primitives: slider, tabs/toggle-group, dialog, drawer/sheet, form + zod, sonner for submit feedback.
- Reuses the existing dark obsidian/copper token set in `src/styles.css`; adds an amber/neon energy accent token if the current `--amber` needs a brighter companion. No hardcoded colors.
- Calculator math is deterministic and client-side (peak/off-peak rate assumptions declared as named constants so they're easy to tune).
- Own `head()` metadata with an energy-specific title, description, and OG tags.
- Existing wings (`/store`, `/mobility`, `/about`) are untouched; footer gains a link to the new Energy page.
- No generated imagery — layout, type, and CSS gradients only.
