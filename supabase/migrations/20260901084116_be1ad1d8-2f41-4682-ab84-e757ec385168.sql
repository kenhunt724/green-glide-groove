CREATE TABLE public.fleet_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_code text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  site_label text,
  unit_kind text NOT NULL DEFAULT 'power_pod',
  pack_kwh numeric NOT NULL DEFAULT 20,
  module_count integer NOT NULL DEFAULT 8,
  commissioned_at timestamptz NOT NULL DEFAULT now(),
  cycles_per_week numeric NOT NULL DEFAULT 6,
  duty_factor numeric NOT NULL DEFAULT 1,
  service_contract boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'simulated',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.fleet_units TO authenticated;
GRANT ALL ON public.fleet_units TO service_role;
ALTER TABLE public.fleet_units ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage fleet units" ON public.fleet_units FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.unit_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id uuid NOT NULL REFERENCES public.fleet_units(id) ON DELETE CASCADE,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  state_of_health numeric,
  pack_voltage numeric,
  max_cell_temp_c numeric,
  cell_delta_mv numeric,
  cycle_count integer,
  inverter_hours numeric,
  fault_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX unit_telemetry_unit_idx ON public.unit_telemetry (unit_id, recorded_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_telemetry TO authenticated;
GRANT ALL ON public.unit_telemetry TO service_role;
ALTER TABLE public.unit_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage unit telemetry" ON public.unit_telemetry FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_fleet_units_updated_at BEFORE UPDATE ON public.fleet_units
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.fleet_units (unit_code, customer_name, site_label, unit_kind, pack_kwh, module_count, commissioned_at, cycles_per_week, duty_factor, service_contract, status, notes) VALUES
('EPS-CART-001', 'Westside Block Shop', 'Atlanta, GA 30310', 'cart', 5, 4, now() - interval '14 months', 11, 1.2, true, 'simulated', 'Job-site cart, daily tool loads.'),
('EPS-POD-014', 'Hunt Residence', 'Atlanta, GA 30314', 'power_pod', 20, 8, now() - interval '9 months', 7, 1.0, true, 'simulated', 'Whole-home pod on off-peak charging.'),
('EPS-TRL-003', 'Southeast Tour Logistics', 'Mobile / touring', 'trailer', 60, 16, now() - interval '5 months', 9, 1.35, true, 'simulated', 'Towable stage power, heavy summer duty.'),
('EPS-CTR-002', 'Peachtree Edge Compute', 'Marietta, GA 30060', 'container', 500, 96, now() - interval '20 months', 6, 1.1, true, 'simulated', 'Container battery plant, demand-charge shaving.'),
('EPS-POD-021', 'Bankhead Corner Market', 'Atlanta, GA 30318', 'power_pod', 30, 12, now() - interval '3 months', 12, 1.25, false, 'simulated', 'Refrigeration-heavy commercial pod, no service contract yet.');