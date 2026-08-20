-- 1) Column-level restriction on consultation_slots (hide lead_id from public/API roles)
REVOKE SELECT ON public.consultation_slots FROM anon, authenticated;
GRANT SELECT (id, slot_at, duration_minutes, is_booked, created_at, updated_at)
  ON public.consultation_slots TO anon, authenticated;
GRANT ALL ON public.consultation_slots TO service_role;

-- 2) has_role: switch to SECURITY INVOKER (users can read their own roles via RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$function$;