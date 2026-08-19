ALTER TABLE public.energy_leads ADD COLUMN IF NOT EXISTS solution_interest text;
ALTER TABLE public.energy_leads ADD COLUMN IF NOT EXISTS vehicle_type text;
ALTER TABLE public.energy_leads ALTER COLUMN roof_condition DROP NOT NULL;