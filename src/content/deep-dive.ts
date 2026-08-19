export interface DeepDiveSection {
  id: string;
  title: string;
  summary: string;
  points: string[];
  metric: { value: string; label: string };
}

export const deepDive: DeepDiveSection[] = [
  {
    id: "urban-metabolism",
    title: "Closed-Loop Urban Metabolism",
    summary:
      "Every output of one process is booked as the input of another. Waste heat, greywater, organics and scrap steel circulate inside a single metabolic ledger held at the block scale.",
    points: [
      "Shop-floor waste heat recovered into the domestic hot-water loop of the adjacent residences.",
      "Greywater polished on site through constructed reed beds, reused for wash bays and tree pits.",
      "Organics digested locally; biogas trimmed into the flex-fuel blend used by the range extender.",
      "Aluminium and steel offcuts re-melted in the neighbourhood foundry, never leaving the district.",
    ],
    metric: { value: "91%", label: "Material recirculation rate" },
  },
  {
    id: "load-defection",
    title: "Off-Peak Battery UPS & Load Defection",
    summary:
      "The campus buys electrons when nobody else wants them. LiFePO4 cabinets charge in the small hours, carry the site through peak pricing, and double as a seamless uninterruptible supply.",
    points: [
      "1.8 MWh of LiFePO4 across modular cabinets, cycled between 15% and 90% state of charge.",
      "Online double-conversion UPS topology: zero-transfer-time protection for the mastering suite.",
      "Peak-shaving controller defects up to 74% of billed demand charges away from the utility.",
      "Grid-forming inverters allow islanded operation of critical loads for 36 hours.",
    ],
    metric: { value: "74%", label: "Peak demand defected" },
  },
  {
    id: "leed-platinum",
    title: "LEED Platinum Community Standards",
    summary:
      "Buildings are held to LEED Platinum not as a plaque but as an operating floor — commissioned annually, published openly, and written into every tenancy agreement on the block.",
    points: [
      "Mass-timber and reclaimed-brick structure with a measured 62% reduction in embodied carbon.",
      "Triple-glazed envelope, heat-recovery ventilation, no fossil combustion for space conditioning.",
      "Daylight autonomy above 75% in all workshop and studio floors.",
      "Annual re-commissioning with public dashboards for energy, water and indoor air quality.",
    ],
    metric: { value: "62%", label: "Embodied carbon avoided" },
  },
  {
    id: "job-creation",
    title: "Local Technician Job Creation",
    summary:
      "Sovereignty is a labour question. Drivetrains, batteries and audio hardware are built, serviced and re-manufactured by technicians who live within cycling distance of the shop.",
    points: [
      "Four-year paid apprenticeship covering high-voltage safety, e-axle service and battery diagnostics.",
      "Open service manuals and tooling — every vehicle repairable by any certified local shop.",
      "Re-manufacturing line keeps end-of-life packs and axles in the local economy.",
      "Wage floor pegged to regional housing cost, reviewed publicly each year.",
    ],
    metric: { value: "128", label: "Technician roles created" },
  },
];
