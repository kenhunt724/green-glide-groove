CREATE TABLE public.energy_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  property_type TEXT NOT NULL,
  monthly_bill_range TEXT NOT NULL,
  roof_condition TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.energy_leads TO anon, authenticated;
GRANT ALL ON public.energy_leads TO service_role;

ALTER TABLE public.energy_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an assessment request"
  ON public.energy_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);