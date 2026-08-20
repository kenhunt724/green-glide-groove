CREATE TABLE public.community_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'apprentice',
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  neighborhood text NOT NULL,
  trade_interest text,
  shop_name text,
  capabilities text,
  availability text,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.community_signups TO anon, authenticated;
GRANT SELECT, UPDATE ON public.community_signups TO authenticated;
GRANT ALL ON public.community_signups TO service_role;

ALTER TABLE public.community_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a community signup"
  ON public.community_signups FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Admins can read community signups"
  ON public.community_signups FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update community signups"
  ON public.community_signups FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_community_signups_updated_at
  BEFORE UPDATE ON public.community_signups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();