import containerImage from "@/assets/container-storage.jpg";
import { ContactPhone } from "@/components/contact-phone";

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-panel p-8">
      <p className="slide-title text-white">{value}</p>
      <p className="slide-caption mt-2 text-muted-foreground">{label}</p>
    </div>
  );
}

function Pill({ label }: { label: string }) {
  return (
    <span className="slide-badge border border-energy/30 bg-energy/10 px-6 py-3 text-energy">
      {label}
    </span>
  );
}

function Pillar({ title, body }: { title: string; body: string }) {
  return (
    <div className="surface-panel p-8">
      <h3 className="slide-body-lg text-white">{title}</h3>
      <p className="slide-body mt-3 text-muted-foreground">{body}</p>
    </div>
  );
}

function TitleSlide() {
  return (
    <div className="slide-content flex flex-col justify-between bg-obsidian p-20 text-foreground">
      <div className="slide-kicker text-energy">
        Earth Protection Society · Energy Division
      </div>
      <div>
        <h1 className="slide-title-lg max-w-5xl text-white">
          Free compute from the feeder.
        </h1>
        <p className="slide-subtitle mt-8 max-w-3xl text-muted-foreground">
          A customer-funded retrofit playbook that turns data centers into edge
          compute centers — no new substation, no megawatt feeder wait, no
          outside capital.
        </p>
      </div>
      <div className="slide-body text-muted-foreground">
        Pitch deck for data-center operators
      </div>
    </div>
  );
}

function ProblemSlide() {
  return (
    <div className="slide-content grid grid-cols-2 gap-20 bg-background p-20 text-foreground">
      <div className="flex flex-col justify-center">
        <p className="slide-kicker text-energy">The problem</p>
        <h2 className="slide-title mt-6 text-white">
          The grid is the bottleneck.
        </h2>
        <ul className="mt-10 space-y-6">
          <li className="slide-body text-muted-foreground">
            <strong className="text-foreground">Transformer overload:</strong>{" "}
            AI and HPC clusters are pulling record power through aging
            neighborhood transformers.
          </li>
          <li className="slide-body text-muted-foreground">
            <strong className="text-foreground">Demand charges:</strong> Peak
            window draw is the most expensive part of the bill, and it keeps
            rising.
          </li>
          <li className="slide-body text-muted-foreground">
            <strong className="text-foreground">Utility queue waits:</strong>{" "}
            New substations and megawatt feeders can take years to approve and
            build.
          </li>
          <li className="slide-body text-muted-foreground">
            <strong className="text-foreground">Diesel dependency:</strong>{" "}
            Backup generators are loud, dirty, and limited by fuel delivery.
          </li>
        </ul>
      </div>
      <div className="flex flex-col justify-center gap-8">
        <StatBox label="Typical demand charge" value="[$/kW — replace]" />
        <StatBox label="Utility queue wait" value="[Months — replace]" />
        <StatBox label="Diesel generator uptime" value="[Hours — replace]" />
      </div>
    </div>
  );
}

function SolutionSlide() {
  return (
    <div className="slide-content relative text-white">
      <img
        src={containerImage}
        alt="Container energy plant installed beside an industrial building"
        className="absolute inset-0 size-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
      <div className="relative flex h-full flex-col justify-center p-20">
        <p className="slide-kicker text-energy">The solution</p>
        <h2 className="slide-title mt-6 max-w-3xl">Container Energy Plant</h2>
        <p className="slide-subtitle mt-8 max-w-2xl text-muted-foreground">
          100–500+ kWh of LiFePO4 storage in a 20- or 40-foot container. Drops
          onto existing pads, halls, warehouses, and brownfields.
        </p>
        <div className="mt-12 flex gap-6">
          <Pill label="Retrofit-first" />
          <Pill label="Air-gapped control" />
          <Pill label="Community-serviced" />
        </div>
      </div>
    </div>
  );
}

function HowItWorksSlide() {
  const steps = [
    {
      id: "charge",
      step: "01",
      title: "Charge off-peak",
      body: "The container fills overnight at super off-peak rates — roughly 2.3¢/kWh on time-of-use tariffs.",
    },
    {
      id: "discharge",
      step: "02",
      title: "Discharge on-peak",
      body: "During peak pricing windows the plant powers racks from stored energy, shaving demand charges off the utility bill.",
    },
    {
      id: "island",
      step: "03",
      title: "Island through outages",
      body: "When the grid sags or fails, the inverter instantly islands critical loads — no diesel, no fumes, no fuel truck.",
    },
  ];
  return (
    <div className="slide-content flex flex-col bg-background p-20 text-foreground">
      <p className="slide-kicker text-energy">How it works</p>
      <h2 className="slide-title mt-6 text-white">
        Buy low. Discharge high. Stay online.
      </h2>
      <div className="mt-16 grid grid-cols-3 gap-8">
        {steps.map((s) => (
          <div key={s.id} className="surface-panel p-8">
            <p className="slide-badge text-energy">{s.step}</p>
            <h3 className="slide-subtitle mt-4 text-white">{s.title}</h3>
            <p className="slide-body mt-4 text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function OwnershipSlide() {
  return (
    <div className="slide-content grid grid-cols-2 gap-20 bg-background p-20 text-foreground">
      <div className="flex flex-col justify-center">
        <p className="slide-kicker text-energy">Ownership model</p>
        <h2 className="slide-title mt-6 text-white">
          Customer-funded. Site-owned. Locally serviced.
        </h2>
        <p className="slide-body-lg mt-8 text-muted-foreground">
          The client pays for the hardware and installation. The plant becomes
          a site-owned asset. Maintenance is performed by certified technicians
          from the block, not a distant vendor.
        </p>
      </div>
      <div className="flex flex-col justify-center gap-8">
        <Pillar
          title="Funded by capex"
          body="No outside capital. No recurring SaaS lock-in. The site owns the asset outright."
        />
        <Pillar
          title="Owned by the site"
          body="The plant is a depreciating asset that buys down future power costs instead of a rented service."
        />
        <Pillar
          title="Serviced by the block"
          body="Local certified technicians handle commissioning, firmware audits, and rapid component replacement."
        />
      </div>
    </div>
  );
}

function EconomicsSlide() {
  return (
    <div className="slide-content flex flex-col bg-background p-20 text-foreground">
      <p className="slide-kicker text-energy">Economics</p>
      <h2 className="slide-title mt-6 text-white">
        Turn peak charges into retained equity.
      </h2>
      <div className="mt-16 grid grid-cols-3 gap-8">
        <StatBox label="Off-peak energy cost" value="~2.3¢/kWh" />
        <StatBox label="Peak demand reduction" value="[kW — replace]" />
        <StatBox label="10-year retained equity" value="[$ — replace]" />
      </div>
      <p className="slide-caption mt-12 text-muted-foreground">
        *Actual savings depend on local tariff structure, load profile, and
        container size. Modelled figures are placeholders.
      </p>
    </div>
  );
}

function GroundZeroSlide() {
  const phases = [
    {
      phase: "Week 1–2",
      title: "Site assessment & load study",
      body: "Interval data review, pad survey, interconnection path, and preliminary savings model.",
    },
    {
      phase: "Week 3–6",
      title: "Permitting & procurement",
      body: "Stamped drawings, utility interconnection filing, and container build.",
    },
    {
      phase: "Week 7–10",
      title: "Delivery & commissioning",
      body: "Set on pad, AC/DC tie-in, controls tuning, and operator handoff.",
    },
    {
      phase: "Week 11–12",
      title: "90-day prove-out",
      body: "Telemetry review, peak-shave verification, and local technician sign-off.",
    },
  ];
  return (
    <div className="slide-content flex flex-col bg-background p-20 text-foreground">
      <p className="slide-kicker text-energy">Ground zero project</p>
      <h2 className="slide-title mt-6 text-white">
        One site. One container. Ninety days.
      </h2>
      <div className="mt-16 grid grid-cols-4 gap-6">
        {phases.map((p, i) => (
          <div key={i} className="surface-panel p-6">
            <p className="slide-badge text-energy">{p.phase}</p>
            <h3 className="slide-body-lg mt-4 text-white">{p.title}</h3>
            <p className="slide-body mt-3 text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSlide() {
  return (
    <div className="slide-content flex flex-col items-center justify-center bg-obsidian p-20 text-center text-foreground">
      <p className="slide-kicker text-energy">Next step</p>
      <h2 className="slide-title mt-6 max-w-4xl text-white">
        Start with a free site assessment.
      </h2>
      <p className="slide-subtitle mt-8 max-w-2xl text-muted-foreground">
        We’ll model your load profile, identify the interconnection path, and
        draft a customer-funded proposal.
      </p>
      <a
        href="/energy#book"
        className="mt-14 inline-flex items-center gap-3 bg-energy px-10 py-5 font-display text-2xl font-bold text-background transition-opacity hover:opacity-90"
      >
        Book the assessment
      </a>
      <p className="slide-caption mt-8 text-muted-foreground">
        earthresonancehub.com/energy · eps724@outlook.com
      </p>
      <div className="mt-4">
        <ContactPhone variant="light" />
      </div>
    </div>
  );
}

export const dataCenterSlides = [
  <TitleSlide key="title" />,
  <ProblemSlide key="problem" />,
  <SolutionSlide key="solution" />,
  <HowItWorksSlide key="how" />,
  <OwnershipSlide key="ownership" />,
  <EconomicsSlide key="economics" />,
  <GroundZeroSlide key="ground-zero" />,
  <CtaSlide key="cta" />,
];
