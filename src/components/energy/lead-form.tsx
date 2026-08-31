import { useEffect, useId, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnergyLead } from "@/lib/energy-leads.functions";
import { SlotPicker, formatSlotLabel } from "@/components/energy/slot-picker";
import { billRanges, siteTypes, solutionInterests } from "@/content/energy";
import {
  captureAttribution,
  inferChannel,
  sourceChannels,
  type Attribution,
} from "@/lib/attribution";

type FormState = {
  solution_interest: string;
  property_type: string;
  full_name: string;
  email: string;
  phone: string;
  zip_code: string;
  monthly_bill_range: string;
  preferred_time: string;
  slot_id: string;
  notes: string;
  source_channel: string;
  source_detail: string;
};

const empty: FormState = {
  solution_interest: "",
  property_type: "",
  full_name: "",
  email: "",
  phone: "",
  zip_code: "",
  monthly_bill_range: "",
  preferred_time: "",
  slot_id: "",
  notes: "",
  source_channel: "",
  source_detail: "",
};

const stepLabels = ["Solution", "Property / vehicle", "Location & spend", "Schedule"];

function OptionGrid({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`min-h-11 border px-4 py-3 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none ${
            value === o
              ? "border-energy bg-energy/10 text-energy"
              : "border-border bg-surface hover:border-energy/60"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function LeadForm() {
  const uid = useId();
  const fid = (n: string) => `${uid}-${n}`;
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(empty);
  const [error, setError] = useState<string | null>(null);
  const [slotsAvailable, setSlotsAvailable] = useState(true);
  const attribution = useRef<Attribution | null>(null);

  useEffect(() => {
    const a = captureAttribution();
    attribution.current = a;
    const guess = inferChannel(a);
    if (guess) setForm((f) => (f.source_channel ? f : { ...f, source_channel: guess }));
  }, []);

  const queryClient = useQueryClient();
  const submit = useServerFn(submitEnergyLead);
  const mutation = useMutation({
    mutationFn: (data: FormState & Partial<Attribution>) => submit({ data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["consultation-slots"] }),
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const stepValid = (() => {
    if (step === 0) return form.solution_interest !== "";
    if (step === 1) return form.property_type !== "";
    if (step === 2) {
      return (
        form.full_name.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
        form.phone.trim().length >= 7 &&
        form.zip_code.trim().length >= 3 &&
        form.monthly_bill_range !== ""
      );
    }
    // No open slots: the visitor can still submit and we schedule by phone.
    return slotsAvailable ? form.slot_id !== "" && form.preferred_time !== "" : true;
  })();

  if (mutation.isSuccess) {
    return (
      <div className="surface-panel flex flex-col items-start gap-4 p-8">
        <CheckCircle2 className="size-8 text-emerald" aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold">Assessment request received</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {form.slot_id ? (
            <>
              Your slot is locked in for{" "}
              <span className="text-foreground">{form.preferred_time}</span>.
            </>
          ) : (
            <>
              No online slots were open, so we will call{" "}
              <span className="text-foreground">{form.phone}</span> to schedule.
            </>
          )}{" "}
          A community-trained technician will confirm at{" "}
          <span className="text-foreground">{form.email}</span> and prepare your{" "}
          <span className="text-foreground">{form.solution_interest}</span> scope.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(empty);
            setStep(0);
            mutation.reset();
          }}
          className="label-mono min-h-11 border border-border px-4 hover:border-energy hover:text-energy"
        >
          Book another site
        </button>
      </div>
    );
  }

  return (
    <form
      className="surface-panel p-6 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        if (step < 3) {
          if (stepValid) setStep((s) => s + 1);
          return;
        }
        if (!stepValid) return;
        const base = slotsAvailable
          ? form
          : { ...form, slot_id: "", preferred_time: "Call me to schedule" };
        const payload = { ...base, ...(attribution.current ?? {}) };
        mutation.mutate(payload, {
          onError: (err) =>
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again."),
        });
      }}
    >
      <ol className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Booking progress">
        {stepLabels.map((l, i) => (
          <li
            key={l}
            aria-current={i === step ? "step" : undefined}
            className={`label-mono ${i === step ? "text-energy" : i < step ? "text-foreground" : ""}`}
          >
            {String(i + 1).padStart(2, "0")} {l}
          </li>
        ))}
      </ol>

      <div className="mt-4 h-1 w-full bg-muted">
        <div
          className="h-full bg-energy transition-[width] duration-300"
          style={{ width: `${((step + 1) / 4) * 100}%` }}
        />
      </div>

      <div className="mt-8 space-y-5">
        {step === 0 && (
          <div className="space-y-3">
            <p className="label-mono">What are you interested in?</p>
            <OptionGrid
              name="Solution interest"
              options={solutionInterests}
              value={form.solution_interest}
              onChange={set("solution_interest")}
            />
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="label-mono">Property or vehicle type</p>
            <OptionGrid
              name="Property or vehicle type"
              options={siteTypes}
              value={form.property_type}
              onChange={set("property_type")}
            />
          </div>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor={fid("full_name")}>Full name</Label>
              <Input
                id={fid("full_name")}
                value={form.full_name}
                autoComplete="name"
                onChange={(e) => set("full_name")(e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={fid("email")}>Email</Label>
                <Input
                  id={fid("email")}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={fid("phone")}>Phone</Label>
                <Input
                  id={fid("phone")}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={fid("zip_code")}>Atlanta / Southeast ZIP code</Label>
              <Input
                id={fid("zip_code")}
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.zip_code}
                onChange={(e) => set("zip_code")(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <p className="label-mono">Monthly utility spend</p>
              <OptionGrid
                name="Monthly utility spend"
                options={billRanges}
                value={form.monthly_bill_range}
                onChange={set("monthly_bill_range")}
              />
            </div>
            <div className="space-y-3">
              <p className="label-mono">How did you hear about us?</p>
              <OptionGrid
                name="How did you hear about us"
                options={sourceChannels}
                value={form.source_channel}
                onChange={set("source_channel")}
              />
              {form.source_channel !== "" && (
                <div className="space-y-2">
                  <Label htmlFor={fid("source_detail")}>
                    Who or where, exactly? (optional)
                  </Label>
                  <Input
                    id={fid("source_detail")}
                    placeholder="Name of the person, agent, post or event"
                    value={form.source_detail}
                    onChange={(e) => set("source_detail")(e.target.value)}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-3">
              <p className="label-mono">
                {form.solution_interest === "Mobile Silent Generator"
                  ? "Generator demo time"
                  : "On-site assessment time"}
              </p>
              <SlotPicker
                value={form.slot_id}
                onAvailability={setSlotsAvailable}
                onChange={(slot) =>
                  setForm((f) => ({
                    ...f,
                    slot_id: slot.id,
                    preferred_time: formatSlotLabel(slot.slot_at),
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={fid("notes")}>Anything we should know? (optional)</Label>
              <Textarea
                id={fid("notes")}
                rows={3}
                value={form.notes}
                onChange={(e) => set("notes")(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-6 border border-destructive/60 bg-destructive/10 p-3 text-sm">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="label-mono min-h-11 border border-border px-5 transition-colors hover:border-energy hover:text-energy"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={!stepValid || mutation.isPending}
          className="label-mono inline-flex min-h-11 items-center gap-2 bg-energy px-6 font-semibold text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {mutation.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {step < 3 ? "Continue" : "Lock in my assessment"}
        </button>
        <span className="label-mono">Step {step + 1} of 4</span>
      </div>
    </form>
  );
}
