REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.validate_energy_lead_outcome() FROM PUBLIC, anon;

CREATE POLICY "Admins can read producer orders"
  ON public.producer_orders FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.producer_orders TO authenticated;