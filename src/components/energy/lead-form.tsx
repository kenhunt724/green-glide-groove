import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitEnergyLead } from "@/lib/energy-leads.functions";
import { SlotPicker, formatSlotLabel } from "@/components/energy/slot-picker";
import { billRanges, propertyTypes, roofConditions } from "@/content/energy";

type FormState = {
  full_name: string;
  email: string;
  phone: string;
  zip_code: string;
  property_type: string;
  monthly_bill_range: string;
  roof_condition: string;
  preferred_time: string;
  slot_id: string;
  notes: string;
};

const empty: FormState = {
  full_name: "",
  email: "",
  phone: "",
  zip_code: "",
  property_type: "",
  monthly_bill_range: "",
  roof_condition: "",
  preferred_time: "",
  slot_id: "",
  notes: "",
};

const stepLabels = ["Contact", "Property", "Energy profile", "Schedule"];

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

  const queryClient = useQueryClient();
  const submit = useServerFn(submitEnergyLead);
  const mutation = useMutation({
    mutationFn: (data: FormState) => submit({ data }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["consultation-slots"] }),
  });

  const set = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const stepValid = (() => {
    if (step === 0) {
      return (
        form.full_name.trim().length > 1 &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) &&
        form.phone.trim().length >= 7 &&
        form.zip_code.trim().length >= 3
      );
    }
    if (step === 1) return form.property_type !== "";
    if (step === 2) return form.monthly_bill_range !== "" && form.roof_condition !== "";
    return form.slot_id !== "" && form.preferred_time !== "";
  })();

  if (mutation.isSuccess) {
    return (
      <div className="surface-panel flex flex-col items-start gap-4 p-8">
        <CheckCircle2 className="size-8 text-energy" aria-hidden="true" />
        <h3 className="font-display text-2xl font-semibold">Assessment request received</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          A community-trained technician will reach out at{" "}
          <span className="text-foreground">{form.email}</span> to confirm your{" "}
          {form.preferred_time.toLowerCase()} slot and pull your utility interval data.
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
        mutation.mutate(form, {
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
              <Label htmlFor={fid("zip_code")}>Atlanta / regional ZIP code</Label>
              <Input
                id={fid("zip_code")}
                inputMode="numeric"
                autoComplete="postal-code"
                value={form.zip_code}
                onChange={(e) => set("zip_code")(e.target.value)}
              />
            </div>
          </>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <p className="label-mono">Property type</p>
            <OptionGrid
              name="Property type"
              options={propertyTypes}
              value={form.property_type}
              onChange={set("property_type")}
            />
          </div>
        )}

        {step === 2 && (
          <>
            <div className="space-y-3">
              <p className="label-mono">Current monthly power bill</p>
              <OptionGrid
                name="Monthly power bill range"
                options={billRanges}
                value={form.monthly_bill_range}
                onChange={set("monthly_bill_range")}
              />
            </div>
            <div className="space-y-3">
              <p className="label-mono">Roof condition</p>
              <OptionGrid
                name="Roof condition"
                options={roofConditions}
                value={form.roof_condition}
                onChange={set("roof_condition")}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-3">
              <p className="label-mono">Preferred consultation time</p>
              <SlotPicker
                value={form.slot_id}
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
          {step < 3 ? "Continue" : "Book my site assessment"}
        </button>
        <span className="label-mono">Step {step + 1} of 4</span>
      </div>
    </form>
  );
}
