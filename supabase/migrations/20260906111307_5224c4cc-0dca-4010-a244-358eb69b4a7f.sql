CREATE TABLE public.stream_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  target TEXT NOT NULL,
  online BOOLEAN NOT NULL,
  live BOOLEAN NOT NULL DEFAULT false,
  viewers INTEGER,
  latency_ms INTEGER,
  error TEXT
);

CREATE INDEX stream_checks_target_time_idx ON public.stream_checks (target, checked_at DESC);

GRANT SELECT ON public.stream_checks TO anon;
GRANT SELECT ON public.stream_checks TO authenticated;
GRANT ALL ON public.stream_checks TO service_role;

ALTER TABLE public.stream_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Stream checks are publicly readable"
  ON public.stream_checks FOR SELECT
  TO anon, authenticated
  USING (true);