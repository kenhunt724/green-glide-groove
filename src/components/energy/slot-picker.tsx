import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Loader2 } from "lucide-react";
import { listConsultationSlots, type ConsultationSlot } from "@/lib/energy-leads.functions";

const dayFmt = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" });

export function formatSlotLabel(slotAt: string) {
  const d = new Date(slotAt);
  return `${dayFmt.format(d)} · ${timeFmt.format(d)}`;
}

export function SlotPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (slot: ConsultationSlot) => void;
}) {
  const fetchSlots = useServerFn(listConsultationSlots);
  const { data, isPending, isError } = useQuery({
    queryKey: ["consultation-slots"],
    queryFn: () => fetchSlots(),
    staleTime: 60_000,
  });

  const days = useMemo(() => {
    const map = new Map<string, ConsultationSlot[]>();
    for (const s of data?.slots ?? []) {
      const key = dayFmt.format(new Date(s.slot_at));
      const list = map.get(key);
      if (list) list.push(s);
      else map.set(key, [s]);
    }
    return [...map.entries()];
  }, [data]);

  const [dayIndex, setDayIndex] = useState(0);
  const activeDay = days[dayIndex] ?? days[0];

  if (isPending) {
    return (
      <p className="label-mono flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading availability…
      </p>
    );
  }

  if (isError || data?.error || days.length === 0) {
    return (
      <p role="status" className="border border-border bg-surface p-4 text-sm text-muted-foreground">
        No open consultation slots right now. Submit the form and we will call you to schedule.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarDays className="size-4 text-energy" aria-hidden="true" />
        <p className="label-mono">Pick an available day</p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Available days">
        {days.map(([label], i) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={i === dayIndex}
            onClick={() => setDayIndex(i)}
            className={`label-mono min-h-11 border px-4 transition-colors focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none ${
              i === dayIndex
                ? "border-energy bg-energy/10 text-energy"
                : "border-border bg-surface hover:border-energy/60"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div
        role="radiogroup"
        aria-label={`Times on ${activeDay?.[0] ?? ""}`}
        className="grid gap-2 sm:grid-cols-3"
      >
        {(activeDay?.[1] ?? []).map((s) => (
          <button
            key={s.id}
            type="button"
            role="radio"
            aria-checked={value === s.id}
            onClick={() => onChange(s)}
            className={`min-h-11 border px-4 py-3 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-energy focus-visible:outline-none ${
              value === s.id
                ? "border-energy bg-energy/10 text-energy"
                : "border-border bg-surface hover:border-energy/60"
            }`}
          >
            {timeFmt.format(new Date(s.slot_at))}
            <span className="label-mono mt-1 block text-muted-foreground">
              {s.duration_minutes} min
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
