REVOKE SELECT ON public.consultation_slots FROM anon, authenticated;
GRANT SELECT (id, slot_at, duration_minutes, is_booked, created_at, updated_at) ON public.consultation_slots TO anon, authenticated;
GRANT ALL ON public.consultation_slots TO service_role;