import { useMemo, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

// Tariff assumptions — Georgia Power style time-of-use, tunable.
const PEAK_RATE = 0.2; // $/kWh, on-peak tiered utility rate
const BLENDED_RATE = 0.135; // $/kWh, blended standard tiered rate
const OFF_PEAK_RATE = 0.023; // $/kWh, super off-peak charging rate
const ROUND_TRIP_EFFICIENCY = 0.92;
const PEAK_SHARE = 0.45; // share of consumption inside peak/shoulder windows
const SOLAR_OFFSET_PER_SQFT = 0.0042; // fraction of load offset per sq ft
const MAX_SOLAR_OFFSET = 0.38;
const EQUITY_MULTIPLIER = 0.62; // share of 10-yr savings retained as equity

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function SavingsCalculator() {
  const [bill, setBill] = useState(320);
  const [sqft, setSqft] = useState(2400);

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

  const barMax = Math.max(bill, r.newBill);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="surface-panel space-y-10 p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="bill" className="label-mono">
              Average monthly power bill
            </Label>
            <span className="font-display text-2xl font-bold tabular-nums text-energy">
              {usd(bill)}
              {bill >= 800 ? "+" : ""}
            </span>
          </div>
          <Slider
            id="bill"
            aria-label="Average monthly power bill in dollars"
            value={[bill]}
            min={100}
            max={800}
            step={10}
            onValueChange={([v]) => setBill(v ?? 100)}
          />
          <div className="label-mono flex justify-between">
            <span>$100</span>
            <span>$800+</span>
          </div>
        </div>

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
            Roof area drives the zero-export array we can pair with the vault — currently modelling{" "}
            <span className="text-foreground">{Math.round(r.solarOffset * 100)}%</span> solar
            self-supply.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="surface-panel space-y-6 p-6 md:p-8">
          <p className="label-mono">Monthly cost comparison</p>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-muted-foreground">Standard tiered utility bill</span>
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
            <span className="font-semibold text-energy">{Math.round(r.peakCut * 100)}%</span> by
            charging at ~2.3¢/kWh and discharging through the 2–7 PM window.
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

        <p className="text-xs text-muted-foreground">
          Estimates model Georgia Power–style time-of-use tariffs with a 92% round-trip LiFePO4
          efficiency. Your site assessment produces a binding engineered figure.
        </p>
      </div>
    </div>
  );
}
