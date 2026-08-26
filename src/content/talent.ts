export const linkedInCopy = {
  headline:
    "Earth Protection Society — Sovereign power, local ownership, no outside investors.",
  tagline:
    "We build battery-backed energy systems that cut peak rates, stop outages, and keep the money on the block.",
  about: `Earth Protection Society is a community-owned technology and energy company building the sovereign power layer for neighborhoods, small businesses, and edge compute sites.

We design, install, and service detached LiFePO4 battery vaults, silent mobile generator carts, towable power trailers, and container-scale energy plants. Every system is engineered around the same idea: buy electricity when it is cheap, store it, and use it when the grid is expensive or unreliable. No fumes. No noise. No multi-year interconnection queue.

What we are not: a venture-backed startup, a leasing company, or a remote utility program. Every project is customer-funded. Every plant is owned by the site and the neighborhood that built it. Every technician is trained and certified locally.

We are currently hiring certified battery and solar technicians, site evaluators, data-center energy engineers, and partnership leads in the Atlanta metro. If you believe energy should be a local paycheck and a neighborhood asset, send your resume or LinkedIn profile through our site or call 404-454-0602.`,
  posts: [
    {
      id: "site-eval",
      title: "Same-day site evaluations are open",
      body: `If your utility bill is climbing, your lights flicker, or you are tired of gas-generator noise, call us at 404-454-0602 for a same-day site evaluation.

We will walk your property, review twelve months of interval data, and tell you whether a LiFePO4 battery vault, silent generator cart, or container energy plant makes sense — no obligation, no sales theatre.

Customer-funded. Locally owned. No outside investors.

#energystorage #solar #batterystorage #offpeak #datacenter #edgecompute #atlanta #cleanenergy #localjobs`,
    },
    {
      id: "harvester-ladder",
      title: "The Electricity Power Harvester ladder",
      body: `We call them Electricity Power Harvesters because that is exactly what they do: harvest cheap electricity and deliver it when you need it most.

• Silent Generator Cart — 2–5 kWh, portable, charges overnight or from your alternator.
• Residential & Commercial Power Pod — 30–80 kWh detached vault, zero living-space intrusion.
• Container Energy Plant — 100–500+ kWh for data centers, warehouses, and commercial campuses.

All three run on the same Victron GX brain, the same LiFePO4 chemistry, and the same local service model. Charge at ~2.3¢/kWh, discharge through peak windows, and never wait in a substation queue.

Which one fits your site? Call 404-454-0602.

#energystorage #batterystorage #offpeak #datacenter #edgecompute #solar #atlanta #localownership`,
    },
    {
      id: "hiring",
      title: "We are hiring local energy talent",
      body: `Earth Protection Society is building a local technician corps for detached battery vaults, rooftop solar integration, and container-scale energy plants.

Open roles:
• Site Evaluator / Field Assessor
• Certified Battery & Solar Technician
• Data Center Energy Engineer
• Business Development — Partnerships & JVs

Atlanta-first. Contract-to-W2 as the Block scales. Customer-funded, no outside investors, no remote utility program.

Apply at earthresonancehub.com/join or call 404-454-0602.

#hiring #energyjobs #atlanta #solarjobs #batterystorage #technician #datacenter #localjobs`,
    },
  ],
} as const;

export const roles = [
  {
    id: "site-evaluator",
    title: "Site Evaluator / Field Assessor",
    type: "Field / Atlanta-first",
    pay: "Contract per evaluation → W2 as volume scales",
    summary:
      "Visit residential and commercial properties, confirm roof/structural conditions, review interval utility data, and produce a pre-engineering intake packet for our design team.",
    mustHave: [
      "Comfort on roofs and in electrical rooms",
      "Basic electrical literacy (120/240V, panel basics)",
      "Reliable vehicle and clean driving record",
      "Customer-facing communication skills",
    ],
    niceToHave: [
      "Solar or energy auditing background",
      "Drone or thermal-imaging experience",
      "NABCEP or similar credential",
    ],
  },
  {
    id: "battery-tech",
    title: "Certified Battery & Solar Technician",
    type: "Field / Atlanta-first",
    pay: "Contract-to-W2 with training stipend",
    summary:
      "Install, commission, and maintain Victron GX-controlled LiFePO4 systems, DC-coupled rooftop arrays, and detached outbuilding vaults.",
    mustHave: [
      "Electrical trade experience or equivalent hands-on background",
      "Willingness to complete Victron / LiFePO4 certification",
      "Tool ownership and reliable transport",
      "Safety-first mindset around high-voltage DC",
    ],
    niceToHave: [
      "Licensed electrician or apprentice",
      "Rooftop solar racking and flashing experience",
      "Low-voltage controls / PLC familiarity",
    ],
  },
  {
    id: "dc-engineer",
    title: "Data Center Energy Engineer",
    type: "Hybrid / Atlanta-first, remote possible",
    pay: "Contract or W2 depending on engagement",
    summary:
      "Size container-scale LiFePO4 plants for peak shaving and outage ride-through. Model demand-charge economics, write retrofit playbooks, and support commissioning at edge compute sites.",
    mustHave: [
      "Power systems or electrical engineering background",
      "Experience with UPS, BESS, or data-center power distribution",
      "Ability to produce stamped-ready calculations and one-line diagrams",
      "Understanding of utility tariffs and demand charges",
    ],
    niceToHave: [
      "PE license or EIT",
      "Container / modular construction experience",
      "Edge compute or colocation operations background",
    ],
  },
  {
    id: "partnerships",
    title: "Business Development — Partnerships & JVs",
    type: "Hybrid / Atlanta-first",
    pay: "Commission + equity-like community stake",
    summary:
      "Identify land owners, installers, data-center operators, and commercial property groups who want customer-funded, locally owned energy capacity.",
    mustHave: [
      "Proven B2B or partnership development track record",
      "Ability to explain energy economics to non-technical buyers",
      "Self-starter who can open doors without a big marketing budget",
      "Alignment with customer-funded, no-investor model",
    ],
    niceToHave: [
      "Energy, solar, or data-center industry network",
      "Real estate or land-trust experience",
      "Experience with community ownership structures",
    ],
  },
] as const;

export const applicationRoles = roles.map((r) => r.title) as (typeof roles)[number]["title"][];
