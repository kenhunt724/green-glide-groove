import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Tariff assumptions — utility-style time-of-use, tunable.
const PEAK_RATE = 0.2; // $/kWh, on-peak tiered utility rate
const BLENDED_RATE = 0.135; // $/kWh, blended standard tiered rate
const OFF_PEAK_RATE = 0.023; // $/kWh, super off-peak charging rate
const ROUND_TRIP_EFFICIENCY = 0.92;
const PEAK_SHARE = 0.45; // share of consumption inside peak/shoulder windows
const SOLAR_OFFSET_PER_SQFT = 0.0042; // fraction of load offset per sq ft
const MAX_SOLAR_OFFSET = 0.38;
const EQUITY_MULTIPLIER = 0.62; // share of 10-yr savings retained as equity

// Mobile generator assumptions.
const GAS_PRICE = 3.45; // $/gal
const GEN_KWH_PER_GAL = 3.2; // kWh produced per gallon by a typical portable genset
const GEN_MAINTENANCE_PER_HR = 0.35; // oil, filters, plugs, wear per runtime hour
const GEN_LOAD_KW = 2.4; // average draw of a jobsite load

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

type Mode = "stationary" | "mobile";

export function SavingsCalculator() {
  const [mode, setMode] = useState<Mode>("stationary");
  const [bill, setBill] = useState(320);
  const [sqft, setSqft] = useState(2400);
  const [genHours, setGenHours] = useState(40);

  const r = useMemo(() => {
    const kwh = bill / BLENDED_RATE;
    const solarOffset = Math.min(MAX_SOLAR_OFFSET, (sqft * SOLAR_OFFSET_PER_SQFT) / 100);

    const peakKwh = kwh * PEAK_SHARE;
    const basePeakCost = peakKwh * PEAK_RATE;

    const solarCoveredPeak = peakKwh * solarOffset;
    const batteryPeak = peakKwh - solarCoveredPeak;
    const arbitrageCost = (batteryPeak / ROUND_TRIP_EFFICIENCY) * OFF_PEAK_RATE;

    const offPeakKwh = kwh - peakKwh;
    const offPeakCost = offPeakKwh * BLENDED_RATE * (1 - solarOffset * 0.5);

    const newBill = arbitrageCost + offPeakCost + 18; // + fixed service charges
    const savings = Math.max(0, bill - newBill);
    const peakReduction = (peakKwh / 30 / 5) * 1.0; // avg kW shaved across the 5h peak window
    const equity = savings * 12 * 10 * EQUITY_MULTIPLIER;
    const peakCut = basePeakCost > 0 ? 1 - arbitrageCost / basePeakCost : 0;

    return { newBill, savings, peakReduction, equity, peakCut, solarOffset };
  }, [bill, sqft]);

  const m = useMemo(() => {
    const energyKwh = genHours * GEN_LOAD_KW;
    const gallons = energyKwh / GEN_KWH_PER_GAL;
    const fuelCost = gallons * GAS_PRICE;
    const maintenance = genHours * GEN_MAINTENANCE_PER_HR;
    const gasTotal = fuelCost + maintenance;
    const batteryCost = (energyKwh / ROUND_TRIP_EFFICIENCY) * OFF_PEAK_RATE;
    const savings = Math.max(0, gasTotal - batteryCost);
    const co2 = gallons * 19.6; // lbs CO2 per gallon of gasoline
    return { energyKwh, gallons, fuelCost, maintenance, gasTotal, batteryCost, savings, co2 };
  }, [genHours]);

  const barMax =
    mode === "stationary" ? Math.max(bill, r.newBill) : Math.max(m.gasTotal, m.batteryCost);

  return (
    <div className="space-y-8">
      <div
        role="tablist"
        aria-label="Calculator mode"
        className="inline-flex border border-border bg-surface p-1"
      >
        {(
          [
            ["stationary", "Stationary Shed Vault"],
            ["mobile", "Mobile Generator Fuel"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={`label-mono min-h-11 px-5 transition-colors focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none ${
              mode === id ? "bg-energy font-semibold text-background" : "hover:text-energy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="surface-panel space-y-10 p-6 md:p-8">
          <div className="space-y-4">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="bill" className="label-mono">
                Average monthly power bill
              </Label>
              <span className="font-display text-2xl font-bold tabular-nums text-energy">
                {usd(bill)}
                {bill >= 1000 ? "+" : ""}
              </span>
            </div>
            <Slider
              id="bill"
              aria-label="Average monthly power bill in dollars"
              value={[bill]}
              min={100}
              max={1000}
              step={10}
              onValueChange={([v]) => setBill(v ?? 100)}
            />
            <div className="label-mono flex justify-between">
              <span>$100</span>
              <span>$1,000+</span>
            </div>
          </div>

          {mode === "stationary" ? (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="sqft" className="label-mono">
                  Conditioned square footage
                </Label>
                <span className="font-display text-2xl font-bold tabular-nums text-energy">
                  {sqft.toLocaleString()} ft²
                </span>
              </div>
              <Slider
                id="sqft"
                aria-label="Conditioned square footage"
                value={[sqft]}
                min={800}
                max={12000}
                step={100}
                onValueChange={([v]) => setSqft(v ?? 800)}
              />
              <div className="label-mono flex justify-between">
                <span>800 ft²</span>
                <span>12,000 ft²</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Roof area drives the zero-export array we can pair with the vault — currently
                modelling <span className="text-foreground">{Math.round(r.solarOffset * 100)}%</span>{" "}
                solar self-supply.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="genhours" className="label-mono">
                  Generator runtime per month
                </Label>
                <span className="font-display text-2xl font-bold tabular-nums text-emerald">
                  {genHours} hrs
                </span>
              </div>
              <Slider
                id="genhours"
                aria-label="Generator runtime hours per month"
                value={[genHours]}
                min={4}
                max={200}
                step={2}
                onValueChange={([v]) => setGenHours(v ?? 4)}
              />
              <div className="label-mono flex justify-between">
                <span>4 hrs</span>
                <span>200 hrs</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Modelled against a {GEN_LOAD_KW} kW average jobsite load on a portable gas set at{" "}
                {usd(GAS_PRICE)}/gal — roughly{" "}
                <span className="text-foreground">{m.gallons.toFixed(1)} gallons</span> burned per
                month.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {mode === "stationary" ? (
            <>
              <div className="surface-panel space-y-6 p-6 md:p-8">
                <p className="label-mono">Monthly cost comparison</p>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Standard tiered utility bill
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums">{usd(bill)}</span>
                  </div>
                  <div className="h-4 w-full bg-muted">
                    <div
                      className="h-full bg-muted-foreground/50 transition-[width] duration-300"
                      style={{ width: `${(bill / barMax) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Off-peak arbitrage + zero-export solar
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums text-energy">
                      {usd(r.newBill)}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-muted">
                    <div
                      className="h-full bg-energy transition-[width] duration-300"
                      style={{ width: `${(r.newBill / barMax) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Peak-window energy cost cut by{" "}
                  <span className="font-semibold text-energy">{Math.round(r.peakCut * 100)}%</span>{" "}
                  by charging 11 PM – 7 AM at ~2.3¢/kWh and defecting through the 2–7 PM window.
                </p>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-3">
                <div className="bg-background p-5">
                  <p className="label-mono">Est. monthly savings</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-energy">
                    {usd(r.savings)}
                  </p>
                </div>
                <div className="bg-background p-5">
                  <p className="label-mono">Peak demand reduction</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-energy">
                    {r.peakReduction.toFixed(1)} kW
                  </p>
                </div>
                <div className="bg-background p-5">
                  <p className="label-mono">10-year retained equity</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-energy">
                    {usd(r.equity)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="surface-panel space-y-6 p-6 md:p-8">
                <p className="label-mono">Monthly running cost comparison</p>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Gas generator (fuel + maintenance)
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums">
                      {usd(m.gasTotal)}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-muted">
                    <div
                      className="h-full bg-muted-foreground/50 transition-[width] duration-300"
                      style={{ width: `${(m.gasTotal / barMax) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">
                      Mobile LiFePO4 unit charged off-peak
                    </span>
                    <span className="font-display text-lg font-bold tabular-nums text-emerald">
                      {usd(m.batteryCost)}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-muted">
                    <div
                      className="h-full bg-emerald transition-[width] duration-300"
                      style={{ width: `${(m.batteryCost / barMax) * 100}%` }}
                    />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Alternator and solar charging on the road drive that number lower still — every
                  mile driven is free stored energy.
                </p>
              </div>

              <div className="grid gap-px bg-border sm:grid-cols-3">
                <div className="bg-background p-5">
                  <p className="label-mono">Gallons of gas saved</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-emerald">
                    {m.gallons.toFixed(0)}
                  </p>
                </div>
                <div className="bg-background p-5">
                  <p className="label-mono">Est. monthly savings</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-emerald">
                    {usd(m.savings)}
                  </p>
                </div>
                <div className="bg-background p-5">
                  <p className="label-mono">CO₂ avoided</p>
                  <p className="mt-2 font-display text-3xl font-bold tabular-nums text-emerald">
                    {Math.round(m.co2)} lb
                  </p>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground">
            Estimates model utility-style time-of-use tariffs with a 92% round-trip LiFePO4
            efficiency. Your site assessment produces a binding engineered figure.
          </p>
        </div>
      </div>
    </div>
  );
}
