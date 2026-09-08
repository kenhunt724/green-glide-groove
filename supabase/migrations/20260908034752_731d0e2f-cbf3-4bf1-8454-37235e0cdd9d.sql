DROP POLICY "Authenticated users can read applications" ON public.talent_applications;
CREATE POLICY "Admins can read applications" ON public.talent_applications
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));