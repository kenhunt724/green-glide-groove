CREATE TABLE public.consultation_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_at timestamp with time zone NOT NULL UNIQUE,
  duration_minutes integer NOT NULL DEFAULT 45,
  is_booked boolean NOT NULL DEFAULT false,
  lead_id uuid REFERENCES public.energy_leads(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.consultation_slots TO anon;
GRANT SELECT ON public.consultation_slots TO authenticated;
GRANT ALL ON public.consultation_slots TO service_role;

ALTER TABLE public.consultation_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view consultation slots"
  ON public.consultation_slots FOR SELECT
  TO anon, authenticated
  USING (true);

ALTER TABLE public.energy_leads
  ADD COLUMN slot_id uuid REFERENCES public.consultation_slots(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_consultation_slots_updated_at
  BEFORE UPDATE ON public.consultation_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.consultation_slots (slot_at)
SELECT d + t
FROM generate_series(
  date_trunc('day', (now() AT TIME ZONE 'America/New_York')::date + 1),
  date_trunc('day', (now() AT TIME ZONE 'America/New_York')::date + 21),
  interval '1 day'
) AS d
CROSS JOIN (VALUES (interval '9 hours'), (interval '12 hours'), (interval '15 hours'), (interval '17 hours 30 minutes')) AS times(t)
WHERE extract(isodow from d) < 6
ON CONFLICT (slot_at) DO NOTHING;