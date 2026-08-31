ALTER TABLE public.energy_leads
  ADD COLUMN IF NOT EXISTS source_channel text,
  ADD COLUMN IF NOT EXISTS source_detail text,
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS landing_path text,
  ADD COLUMN IF NOT EXISTS referrer_host text,
  ADD COLUMN IF NOT EXISTS entry_mode text NOT NULL DEFAULT 'web_form';

CREATE INDEX IF NOT EXISTS energy_leads_source_channel_idx ON public.energy_leads (source_channel);