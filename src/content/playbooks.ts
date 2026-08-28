export const commercialBessPlaybook = {
  title: "Commercial BESS Deployment Playbook",
  subtitle:
    "Operational Blueprint: Marketing, Supply Chain, and Contractor Partnership Framework",
  lede:
    "A turnkey, net-positive Battery Energy Storage System (BESS) converts commercial facilities, data centers, and high-value residential properties into decentralized, grid-interactive power hubs. This playbook is the Earth Protection Society operating method: customer-funded, locally owned, globally sourced, and built by certified technicians from the block.",
  executiveSummary: [
    {
      id: "ownership",
      title: "Customer-funded, site-owned assets",
      body: "The client pays for the plant once — batteries, inverters, enclosure, installation — and holds title. No outside investors, no recurring SaaS lock-in, no lease-back from a distant financier.",
    },
    {
      id: "land",
      title: "99-year land-use arrangement",
      body: "Where the site does not own the pad location outright, EPS structures a long-term land-use agreement so the plant, its service access, and its interconnection remain secure for the life of the asset.",
    },
    {
      id: "local",
      title: "Built and serviced by the block",
      body: "Every vault is welded, wired, commissioned and maintained by certified local technicians. Resilience becomes a neighborhood paycheck, not a remote utility program.",
    },
    {
      id: "global",
      title: "Source globally, build locally",
      body: "Cells and inverters are qualified across multiple regions so a strike, bankruptcy, fire or tariff shock at one supplier cannot strand a neighborhood plant. Assembly, ownership and service stay local.",
    },
  ],
  pillars: [
    {
      id: "financial",
      kicker: "01 · Financial architecture",
      title: "Turn peak charges into retained equity",
      body: "The value proposition is not 'savings' alone — it is balance-sheet equity. A container battery plant reduces net operating costs, stabilizes demand charges, and lifts property valuation through on-site, depreciating, income-producing infrastructure.",
      points: [
        {
          title: "Demand-charge arbitrage",
          body: "Buy energy at super off-peak rates (~2.3¢/kWh on local utility time-of-use tariffs), store it in LiFePO4, and discharge through peak windows to avoid the most expensive kW on the bill.",
        },
        {
          title: "NOI & cap-rate lift",
          body: "Lower operating expenses and a tangible on-site asset increase net operating income and support higher property valuations for CRE and data-center operators.",
        },
        {
          title: "No outside capital",
          body: "Because the customer funds the build, EPS scales without venture capital, bank debt, or tax-equity partnerships. The project is paid for before it is commissioned.",
        },
      ],
    },
    {
      id: "supply-chain",
      kicker: "02 · Supply chain arbitrage",
      title: "Route around the multi-year queue",
      body: "Utility-scale inverters, medium-voltage step-up transformers, and high-voltage interconnection gear now carry multi-year lead times. Our playbook avoids exactly the gear that is scarce.",
      points: [
        {
          title: "Below-the-meter scale",
          body: "Commercial & industrial-scale inverters below ~5 MW work with existing service capacity. No new substation, no megawatt feeder, no pad-mount step-up transformer.",
        },
        {
          title: "Multi-region vendor qualification",
          body: "Cells and inverters are sourced from qualified vendors across regions. A fire at one factory, a strike at another, or a tariff shock on a third does not freeze the project.",
        },
        {
          title: "Modular, containerized delivery",
          body: "The plant ships as a pre-wired intermodal container or skid. On-site work is limited to pad prep, AC tie-in, and commissioning — not a ground-up electrical build.",
        },
      ],
    },
    {
      id: "contractors",
      kicker: "03 · Contractor partnership model",
      title: "Certified block technicians, not distant vendors",
      body: "EPS trains and certifies local technicians to handle every phase of the deployment. The contractor network is the delivery mechanism and the long-term service layer.",
      points: [
        {
          title: "Local certification corps",
          body: "Site evaluators, battery & solar technicians, and data-center energy engineers are trained and certified locally, then assigned to projects in their own neighborhoods.",
        },
        {
          title: "Clear scope splits",
          body: "EPS provides engineered drawings, equipment, and commissioning oversight. Licensed local partners handle pad, electrical, and utility interconnection work under their own trade licenses.",
        },
        {
          title: "Lifetime service contracts",
          body: "Tiered maintenance plans — Essential, Standard, Sovereign — keep the plant healthy with firmware audits, cell-level health checks, and rapid component replacement.",
        },
      ],
    },
    {
      id: "marketing",
      kicker: "04 · Marketing & sales motion",
      title: "Phone-first site evaluations",
      body: "The front door is a same-day phone call. Every other channel — LinkedIn, direct mail, referral partners — drives to the phone number, because a live conversation is the fastest path to an interval-data review and a booked site visit.",
      points: [
        {
          title: "Same-day site evaluation",
          body: "Call 404-454-0602. We review twelve months of interval data, walk the property, and return an engineered savings figure — no obligation, no sales theatre.",
        },
        {
          title: "Tiered evaluation pricing",
          body: "Residential evaluations start at $150. Commercial and warehouse evaluations run $500–$2,500. Large data-center and campus evaluations scale to $35,000, credited against the build contract when the project proceeds.",
        },
        {
          title: "Referral partnerships",
          body: "Solar installers, electricians, HVAC contractors, and CRE brokers refer properties that show high demand charges, flicker, or outage risk. EPS pays a referral fee only after contract execution.",
        },
      ],
    },
  ],
  phases: [
    {
      phase: "Phase 1",
      weeks: "Weeks 1–2",
      title: "Site Assessment & Engineering",
      body:
        "Collect twelve months of interval data, survey pad or roof conditions, identify the interconnection path, model savings against the local tariff, and produce a stamped preliminary design.",
    },
    {
      phase: "Phase 2",
      weeks: "Weeks 3–6",
      title: "Permitting & Procurement",
      body:
        "Finalize stamped drawings, file utility interconnection paperwork, order long-lead equipment, and schedule certified block technicians for assembly and pre-commissioning.",
    },
    {
      phase: "Phase 3",
      weeks: "Weeks 7–9",
      title: "Delivery & On-Site Installation",
      body:
        "Set the pre-wired container or skid on the pad, pull AC interconnect feeders to the main switchgear, establish local monitoring links, and execute the AC/DC tie-in.",
    },
    {
      phase: "Phase 4",
      weeks: "Week 10",
      title: "Commissioning & Prove-Out",
      body:
        "Run utility witness testing, activate automated peak-shaving routines, verify islanding response, and complete a 90-day telemetry review with local technician sign-off.",
    },
  ],
  productFit: {
    kicker: "Product fit",
    title: "One architecture, four scales",
    body:
      "The same LiFePO4 bank, inverter stack, and local-clock controller are packaged four ways — from a one-person cart to a container-scale plant.",
    products: [
      {
        id: "cart",
        name: "Silent Generator Cart",
        scale: "2–5 kWh",
        fit: "Jobsite tool power, emergency home backup, food trucks, and vendor carts. The gas-generator form factor with no engine, no fuel, no fumes.",
      },
      {
        id: "pod",
        name: "Residential & Commercial Power Pod",
        scale: "30–80 kWh",
        fit: "Detached outbuilding vaults for single-family, multi-family, and small commercial properties. Harvests cheap electricity and runs the building on batteries, not the grid.",
      },
      {
        id: "container",
        name: "Container Battery Plant",
        scale: "100–500+ kWh",
        fit: "Data centers, warehouses, commercial campuses, and edge compute sites. Retrofits onto existing pads and halls with no new substation or megawatt feeder.",
      },
    ],
  },
  cta: {
    title: "Start with a same-day site evaluation",
    body:
      "Call 404-454-0602. We will model your load profile, identify the interconnection path, and draft a customer-funded proposal that fits the Earth Protection Society playbook.",
  },
};
