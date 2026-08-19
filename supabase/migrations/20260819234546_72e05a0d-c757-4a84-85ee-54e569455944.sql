-- 1. Roles infrastructure
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 2. Capacity settings (singleton row)
CREATE TABLE public.capacity_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  technician_days_per_week numeric NOT NULL DEFAULT 10,
  vault_installs_per_week numeric NOT NULL DEFAULT 2,
  generator_builds_per_week numeric NOT NULL DEFAULT 4,
  service_visits_per_week numeric NOT NULL DEFAULT 3,
  technician_count integer NOT NULL DEFAULT 2,
  build_bays integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.capacity_settings TO authenticated;
GRANT ALL ON public.capacity_settings TO service_role;

ALTER TABLE public.capacity_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage capacity settings"
  ON public.capacity_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_capacity_settings_updated_at
  BEFORE UPDATE ON public.capacity_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.capacity_settings
  (technician_days_per_week, vault_installs_per_week, generator_builds_per_week, service_visits_per_week, technician_count, build_bays)
VALUES (10, 2, 4, 3, 2, 1);

-- 3. Job profiles
CREATE TABLE public.job_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_interest text NOT NULL UNIQUE,
  technician_days numeric NOT NULL DEFAULT 1,
  build_hours numeric NOT NULL DEFAULT 0,
  parts_lead_time_days integer NOT NULL DEFAULT 14,
  unit_kind text NOT NULL DEFAULT 'install',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_profiles TO authenticated;
GRANT ALL ON public.job_profiles TO service_role;

ALTER TABLE public.job_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage job profiles"
  ON public.job_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_job_profiles_updated_at
  BEFORE UPDATE ON public.job_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.job_profiles
  (solution_interest, technician_days, build_hours, parts_lead_time_days, unit_kind)
VALUES
  ('Stationary Outbuilding Power Vault', 4, 12, 21, 'install'),
  ('Mobile Silent Generator', 1, 16, 14, 'build'),
  ('Turnkey Combo', 5, 28, 28, 'install');

-- 4. Lead outcome + score tracking
ALTER TABLE public.energy_leads
  ADD COLUMN outcome text NOT NULL DEFAULT 'pending',
  ADD COLUMN outcome_at timestamptz,
  ADD COLUMN score numeric,
  ADD COLUMN scored_at timestamptz;

CREATE OR REPLACE FUNCTION public.validate_energy_lead_outcome()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.outcome NOT IN ('pending', 'won', 'lost') THEN
    RAISE EXCEPTION 'Invalid outcome: %', NEW.outcome;
  END IF;
  IF NEW.outcome <> 'pending' AND NEW.outcome_at IS NULL THEN
    NEW.outcome_at := now();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_energy_lead_outcome_trigger
  BEFORE INSERT OR UPDATE ON public.energy_leads
  FOR EACH ROW EXECUTE FUNCTION public.validate_energy_lead_outcome();

CREATE POLICY "Admins can read leads"
  ON public.energy_leads FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.energy_leads FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, UPDATE ON public.energy_leads TO authenticated;