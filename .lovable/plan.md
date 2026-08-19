# Capacity Engine — scaling product & service as the real currency

You said it right: money is useless without product and service. So the machine-learning work should not chase revenue forecasts — it should tell you how much you can actually **build, install and service** each week, where the bottleneck is, and which incoming demand to take first so no committed job slips.

That is a scheduling + prediction problem, and it runs on the data your site is already collecting (assessment leads, booked consultation slots, solution interest, ZIP, spend band).

## What gets built

**1. Capacity ledger (the unit of currency)**
An internal page at `/ops/capacity` where you declare your real delivery capacity in units that matter:
- Technician-days available per week
- Vault installs per week (detached pod builds)
- Mobile generator units buildable per week
- Maintenance visits per week reserved for existing contracts

These are editable numbers, not guesses baked into code.

**2. Demand → capacity matcher**
Every lead already carries solution interest, property type, spend band and a booked slot. Each solution type gets a job profile (technician-days, build hours, parts lead time). The engine converts the live lead pipeline into a weekly load curve and shows:
- Committed load vs. available capacity per week, 12 weeks out
- The binding constraint each week (technicians, build bench, or parts)
- Overbooked weeks flagged before you promise a date

**3. Lead scoring model (the ML part)**
A gradient-boosted scorer that ranks each lead by likelihood to become a signed install, using ZIP, spend band, solution interest, property type, lead age, and slot-show behaviour. Output is a 0–100 readiness score on every lead row, so when capacity is scarce you fill the bench with the jobs most likely to close instead of first-come-first-served.

Because you have no conversion history yet, this ships in two stages:
- **Stage A (now):** a transparent weighted heuristic scorer with the same interface, so the ranking is useful on day one and you can see exactly why a lead scored what it did.
- **Stage B (once ~150 leads have outcomes):** the same interface backed by a real trained model. You mark leads won/lost as they resolve; that labelling is what makes Stage B possible, so it starts collecting immediately.

**4. Throughput forecast**
A 12-week projection of deliverable units (installs + generator units + service visits) under your current capacity, plus a what-if slider: "add one technician" / "add one build bay" and see how many more units per quarter that unlocks and where the next bottleneck moves to.

## Where the compute runs

Training runs on your Omen 45L — the dataset is tabular and small, so it trains in seconds on CPU; the GPU is not the constraint here. A local Python script exports leads, trains the model, and writes back a small set of coefficients. The app itself only ever evaluates the model, which is fast and needs no GPU. Nothing about your customer data has to leave your machine to train.

## Technical notes

- New table `capacity_settings` (single editable row per week-type: technician-days, install slots, build slots, service slots) and `job_profiles` (per solution type: technician-days, build hours, parts lead-time days). Both admin-only via RLS with a role check, plus GRANTs.
- New columns on `energy_leads`: `outcome` (pending/won/lost), `outcome_at`, `score`, `scored_at`.
- New route `src/routes/_authenticated/ops/capacity.tsx` — behind auth, since it exposes lead data. This is the first authenticated surface on the site, so basic email sign-in plus an `admin` role in a separate `user_roles` table comes with it.
- Scoring and aggregation live in `src/lib/capacity.functions.ts` (server functions); model coefficients live in a small server-side module the training script rewrites.
- Local training script written to `/mnt/documents/eps-ml/train_lead_scorer.py` with a README for running it on the Omen — scikit-learn, exports coefficients as JSON you paste or upload back.
- Reuses the existing dark obsidian/amber token set; no new colors, no generated imagery.

## What I need from you

The job profiles have to reflect your real crew. Rough numbers are fine to start and you can edit them in the UI: how many technician-days does a typical detached vault install take, how long does one mobile generator take to build, and how many techs do you have right now?
