export const trustBadges = [
  "LEED Platinum Standards",
  "Victron Energy Authorized Architecture",
  "Community Trained Technicians",
  "Grid Brownout & Outage Protection",
] as const;

export const steps = [
  {
    id: "off-peak",
    step: "01",
    window: "11 PM – 7 AM",
    title: "Super Off-Peak Overnight Charging",
    body: "The system pulls power automatically between 11 PM and 7 AM at rock-bottom super off-peak utility rates — roughly 2.3¢/kWh on Georgia Power's time-of-use tariffs — and fills the LiFePO4 vault while the grid is quiet.",
  },
  {
    id: "defection",
    step: "02",
    window: "2 PM – 7 PM",
    title: "Peak-Hour Load Defection",
    body: "During the utility's peak pricing window the house automatically disconnects from expensive grid energy and runs 100% on stored LiFePO4 power plus live rooftop solar. No behaviour change, no load shedding, no dimming the lights.",
  },
  {
    id: "zero-export",
    step: "03",
    window: "Daylight",
    title: "Zero-Export Solar Capture",
    body: "Every watt your roof makes goes straight into the batteries as DC instead of being exported back to the utility for a fraction of its retail value. Self-consumption beats buyback credits on every Southeast tariff we have modelled.",
  },
] as const;

export const tiers = [
  {
    id: "stealth",
    name: "Tier 1 — Stealth Industrial Node",
    tagline: "Cerbo GX headless core",
    body: "The full Victron brain with no display, hidden inside a server rack or utility closet. Monitoring lives entirely in the mobile app and browser dashboard.",
    specs: {
      Interface: "Headless — mobile app & browser",
      Placement: "Server rack / utility closet",
      Processing: "Cerbo GX controller, 1 GB RAM",
      "Local clock control": "Air-gapped RTC scheduling, no cloud dependency",
      "Offline reliability": "Full autonomous operation without internet",
    },
  },
  {
    id: "console",
    name: "Tier 2 — Modular Living-Space Console",
    tagline: "Cerbo GX + GX Touch 50/70",
    body: "The same Cerbo GX brain paired with a flush wall-mounted 5\" or 7\" GX Touch display in the living space, so the household can read state of charge at a glance.",
    specs: {
      Interface: 'Flush 5" or 7" GX Touch panel',
      Placement: "Wall-mounted, living space",
      Processing: "Cerbo GX controller + dedicated display bus",
      "Local clock control": "Air-gapped RTC scheduling, editable on-panel",
      "Offline reliability": "Panel keeps full read/write control offline",
    },
  },
  {
    id: "executive",
    name: "Tier 3 — Executive Touch Command Hub",
    tagline: "Ekrano GX all-in-one",
    body: 'The Ekrano GX: an integrated 7" high-performance colour touchscreen and controller in one unit, mounted directly into your wall or console.',
    specs: {
      Interface: 'Integrated 7" high-performance colour touchscreen',
      Placement: "In-wall or console flush mount",
      Processing: "Ekrano GX quad-core, 2 GB RAM, faster refresh",
      "Local clock control": "Air-gapped RTC with multi-schedule profiles",
      "Offline reliability": "Full local UI and control with zero connectivity",
    },
  },
] as const;

export const services = [
  {
    id: "engineering",
    title: "Custom Engineering & Permitting",
    body: "Full system sizing against twelve months of your interval data, sub-panel and critical-load configuration, stamped drawings, and utility interconnection filed on your behalf.",
    points: ["Load study & vault sizing", "Sub-panel design", "Utility interconnection filing"],
  },
  {
    id: "solar",
    title: "Certified Rooftop Solar Integration",
    body: "We partner with certified local solar installers for complete roof-to-vault DC coupling, so the array and the battery are engineered as one system instead of two bolted together.",
    points: ["DC-coupled array design", "Certified installer partners", "Roof-to-vault commissioning"],
  },
  {
    id: "maintenance",
    title: "Lifetime Monitoring & Community Maintenance",
    body: "Tiered ongoing maintenance contracts staffed by local certified technicians: firmware audits, cell-level battery health checks, and rapid on-site component replacement.",
    points: [
      "Essential — annual firmware & health audit",
      "Standard — quarterly audits, 48h on-site response",
      "Sovereign — monthly telemetry review, 12h response, loaner hardware",
    ],
  },
] as const;

export const propertyTypes = ["Single Family", "Multi-Family", "Commercial Warehouse"] as const;
export const billRanges = [
  "Under $150",
  "$150 – $300",
  "$300 – $500",
  "$500 – $800",
  "Over $800",
] as const;
export const roofConditions = [
  "New (0–5 years)",
  "Good (5–15 years)",
  "Aging (15+ years)",
  "Replacement planned",
  "No roof / ground mount",
] as const;
export const consultationTimes = [
  "Weekday morning",
  "Weekday afternoon",
  "Weekday evening",
  "Saturday morning",
  "Flexible — call me",
] as const;

export const vaultAdvantages = [
  {
    id: "permitting",
    title: "Frictionless Permitting & Fast Inspection",
    body: "A detached pod sidesteps the complex indoor residential living-space electrical restrictions that stall interior installs. Inspectors sign off faster because the energy storage never enters a habitable room.",
  },
  {
    id: "intrusion",
    title: "Zero Living Space Intrusion",
    body: "High-voltage battery storage, inverters and active cooling stay completely outside the main home or commercial building — no closet sacrificed, no fan noise, no thermal load added indoors.",
  },
  {
    id: "service",
    title: "Rapid Serviceability",
    body: "Technicians service, upgrade or hot-swap battery modules inside an isolated exterior vault without entering the building or disrupting occupants, tenants or trading hours.",
  },
  {
    id: "leed",
    title: "LEED & Safety Optimized",
    body: "Thermal isolation, dedicated fire separation, and non-chemical magnetic scale water conditioning are integrated into the pod footprint from the first drawing.",
  },
] as const;

export const mobileCharging = [
  {
    id: "off-peak",
    step: "01",
    title: "Home / Business Super Off-Peak",
    body: "Plug into any standard 120V or 240V outlet overnight and fill the pack on ~2.3¢/kWh super off-peak power. A full charge costs less than a coffee.",
  },
  {
    id: "alternator",
    step: "02",
    title: "In-Transit DC-to-DC Alternator Charging",
    body: "A heavy-duty isolated DC-DC charger taps your van, truck or fleet vehicle's alternator so the unit refills while you drive between jobs — no idling, no downtime.",
  },
  {
    id: "solar",
    step: "03",
    title: "Rapid Solar DC Coupling",
    body: "Direct MC4 inputs accept folding briefcase arrays or roof-mounted panels for silent top-ups on site, on the trail, or during multi-day outages.",
  },
] as const;

export const mobileUseCases = [
  "Jobsite tool & compressor power",
  "Emergency home backup",
  "Food trucks & vendor carts",
  "Outdoor events and night shoots",
  "Fleet & service van workstations",
  "Disaster response staging",
] as const;

export const solutionInterests = [
  "Stationary Outbuilding Power Vault",
  "Mobile Silent Generator",
  "Turnkey Combo",
] as const;

export const siteTypes = [
  "Single Family",
  "Commercial Facility",
  "Service Van / Fleet",
  "Multi-Family",
] as const;

export const platforms = [
  {
    id: "cart",
    step: "01",
    scale: "Portable · 2–5 kWh",
    title: "Silent Generator Cart",
    body: "The gas-generator form factor crews already trust — tubular roll cage, never-flat wheels, fold-down handle — with LiFePO4 cells and a pure sine inverter behind the outlet panel instead of an engine.",
    specs: [
      "120V/30A outlet panel, pure sine output",
      "Charges overnight at ~2.3¢/kWh, from solar, or off an alternator",
      "Zero fumes, zero engine noise — safe indoors",
    ],
    who: "For tradespeople, vendors and home backup",
  },
  {
    id: "trailer",
    step: "02",
    scale: "Towable · 20–60 kWh",
    title: "Towable Power Trailer",
    body: "The pod architecture on a single-axle chassis: a full LiFePO4 bank, inverter/charger stack and GX controller in a lockable enclosure you hitch up and pull onto any site that needs remote power.",
    specs: [
      "120/240V split-phase output with jobsite distribution panel",
      "Shore-power, generator or DC solar recharge inputs",
      "Same Victron brain and monitoring as the fixed vaults",
    ],
    who: "For contractors, events and disaster response",
  },
  {
    id: "pod",
    step: "03",
    scale: "Residential & Commercial · 30–80 kWh",
    title: "Residential & Commercial Power Pod",
    body: "A detached outbuilding vault beside the house or business. Storage, inverters and cooling stay outside the living or working space, so permitting moves faster and service never disrupts the household or trading hours.",
    specs: [
      "Harvest electricity when it's cheapest",
      "Runs on batteries, not the grid — power never flickers or goes out",
      "Zero-export DC-coupled rooftop solar capture",
    ],
    who: "For single-family, multi-family and commercial properties",
  },
  {
    id: "container",
    step: "04",
    scale: "Industrial · 100–500+ kWh",
    title: "Container Energy Plant",
    body: "A 20- or 40-foot container built out as a commercial battery plant — racked LiFePO4 modules, industrial inverters, fire separation and active thermal management, delivered and set on a pad. It powers your racks off stored electricity you bought at ~2.3¢/kWh, and shaves the peak off the neighborhood transformer at the same time — no diesel, no fumes, no fuel deliveries.",
    specs: [
      "Power racks off off-peak electricity bought at ~2.3¢/kWh instead of peak demand charges",
      "Demand-charge shaving and peak-window load defection",
      "Instant silent islanding for outage ride-through — no generator, no fuel",
      "Grid-stabilizing discharge during transformer overload events",
      "Frees compute from the feeder — stand up racks at the load and turn a data center into an edge compute center",
      "Remote telemetry with local certified technician service",
    ],
    who: "For data centers, warehouses, fleets and commercial campuses",
  },
] as const;

export const gridResilience = {
  eyebrow: "Grid resilience",
  headline: "Stop brownouts, flickers & outages at the source",
  lede: "Data centers and AI compute are pulling record power through aging neighborhood transformers. Our distributed LiFePO4 vaults absorb that peak demand locally — so the lights stay on and the voltage stays steady.",
  points: [
    {
      id: "peak-shave",
      title: "Neighborhood peak shaving",
      body: "Container and pod-scale banks discharge during evening and summer peaks, trimming the top off transformer and feeder load before utilities fire up dirty peaker plants.",
    },
    {
      id: "voltage-ride-through",
      title: "Flicker & sag correction",
      body: "Sub-second inverter response irons out voltage sags from compressor starts, EV charging clusters and data-center ramp events — no more dimming lights or tripped equipment.",
    },
    {
      id: "outage-backup",
      title: "Seamless outage ride-through",
      body: "When the grid goes down, the vault instantly islands critical loads. No fumes, no fuel deliveries, no generator maintenance — just clean silent power until utility service returns.",
    },
    {
      id: "local-ownership",
      title: "Community-owned resilience",
      body: "Every vault is built, commissioned and serviced by certified local technicians. Resilience becomes a neighborhood asset and a local paycheck, not a remote utility program.",
    },
  ],
} as const;
