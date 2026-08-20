import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCommunitySignup } from "@/lib/community.functions";

type Kind = "apprentice" | "shop";

const emptyForm = {
  full_name: "",
  email: "",
  phone: "",
  neighborhood: "",
  trade_interest: "",
  shop_name: "",
  capabilities: "",
  availability: "",
  notes: "",
};

export function CommunityIntake() {
  const submit = useServerFn(submitCommunitySignup);
  const [kind, setKind] = useState<Kind>("apprentice");
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof emptyForm) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await submit({ data: { kind, ...form } });
      if (!res.ok) {
        toast.error(res.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
      setForm(emptyForm);
      toast.success("Received. A crew lead will reach out.");
    } catch {
      toast.error("Check the form — a field looks incomplete.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-border bg-surface p-8">
        <p className="label-mono">Intake logged</p>
        <h3 className="mt-3 text-2xl font-bold">You&apos;re on the board.</h3>
        <p className="mt-3 text-muted-foreground">
          We work in blocks. A crew lead reviews new intake weekly and reaches out with the next
          build or install where your skill fits.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setDone(false)}>
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Intake type">
        {(
          [
            ["apprentice", "I want to learn a trade"],
            ["shop", "I run a local shop"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={kind === value}
            onClick={() => setKind(value)}
            className={`label-mono rounded-md border px-4 py-2 transition-colors ${
              kind === value
                ? "border-signal bg-signal/10 text-signal"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field id="full_name" label="Full name" value={form.full_name} onChange={set("full_name")} required />
        <Field id="email" label="Email" type="email" value={form.email} onChange={set("email")} required />
        <Field id="phone" label="Phone" value={form.phone} onChange={set("phone")} required />
        <Field
          id="neighborhood"
          label="Neighborhood"
          placeholder="e.g. West End, Vine City"
          value={form.neighborhood}
          onChange={set("neighborhood")}
          required
        />

        {kind === "apprentice" ? (
          <>
            <Field
              id="trade_interest"
              label="Trade you want"
              placeholder="Fabrication, battery assembly, install, wiring"
              value={form.trade_interest}
              onChange={set("trade_interest")}
            />
            <Field
              id="availability"
              label="Availability"
              placeholder="Weekdays, evenings, full-time"
              value={form.availability}
              onChange={set("availability")}
            />
          </>
        ) : (
          <>
            <Field id="shop_name" label="Shop name" value={form.shop_name} onChange={set("shop_name")} />
            <Field
              id="availability"
              label="Bench availability"
              placeholder="Hours or units per week"
              value={form.availability}
              onChange={set("availability")}
            />
            <div className="md:col-span-2">
              <Label htmlFor="capabilities">Machines and capabilities</Label>
              <Textarea
                id="capabilities"
                className="mt-2"
                rows={3}
                placeholder="Welding, CNC, powder coat, upholstery, electrical, paint booth…"
                value={form.capabilities}
                onChange={(e) => set("capabilities")(e.target.value)}
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <Label htmlFor="notes">Anything else</Label>
          <Textarea
            id="notes"
            className="mt-2"
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes")(e.target.value)}
          />
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6 w-full md:w-auto" disabled={busy}>
        {busy ? "Sending…" : kind === "apprentice" ? "Join the trade pipeline" : "Register the shop"}
      </Button>
      <p className="label-mono mt-4 text-muted-foreground">
        Private. Only crew leads see intake details.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        className="mt-2"
        value={value}
        placeholder={placeholder}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
