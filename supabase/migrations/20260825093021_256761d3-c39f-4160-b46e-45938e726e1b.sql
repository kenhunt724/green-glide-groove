-- Ensure lead_id is never readable by public API roles
REVOKE ALL ON public.consultation_slots FROM anon, authenticated;
GRANT SELECT (id, slot_at, duration_minutes, is_booked, created_at, updated_at)
  ON public.consultation_slots TO anon, authenticated;
GRANT ALL ON public.consultation_slots TO service_role;

-- Narrow row visibility: public only sees open, future slots; admins see all
DROP POLICY IF EXISTS "Anyone can view consultation slots" ON public.consultation_slots;

CREATE POLICY "Public can view open upcoming slots"
  ON public.consultation_slots FOR SELECT
  TO anon, authenticated
  USING (is_booked = false AND slot_at > now());

CREATE POLICY "Admins can view all consultation slots"
  ON public.consultation_slots FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));