-- Invite-only creator program: limited slots, creator-owned pages and uncompressed masters.

-- ---------------------------------------------------------------- settings
CREATE TABLE IF NOT EXISTS public.creator_program_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  max_creator_slots integer NOT NULL DEFAULT 25,
  invite_only boolean NOT NULL DEFAULT true,
  max_master_bytes bigint NOT NULL DEFAULT 2147483648,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.creator_program_settings TO anon, authenticated;
GRANT ALL ON public.creator_program_settings TO service_role;
ALTER TABLE public.creator_program_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Program settings are public" ON public.creator_program_settings
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins manage program settings" ON public.creator_program_settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_creator_program_settings_updated_at
  BEFORE UPDATE ON public.creator_program_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.creator_program_settings (max_creator_slots) VALUES (25);

-- ---------------------------------------------------------------- invites
CREATE TABLE IF NOT EXISTS public.creator_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  invited_name text,
  invited_email text,
  note text,
  max_uses integer NOT NULL DEFAULT 1,
  used_count integer NOT NULL DEFAULT 0,
  expires_at timestamptz,
  revoked boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);

-- Codes are redeemed through a server function using the service role, so no
-- anon read access here.
GRANT SELECT, INSERT, UPDATE ON public.creator_invites TO authenticated;
GRANT ALL ON public.creator_invites TO service_role;
ALTER TABLE public.creator_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage creator invites" ON public.creator_invites
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ---------------------------------------------------------------- pages
CREATE TABLE IF NOT EXISTS public.creator_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id uuid NOT NULL UNIQUE,
  handle text NOT NULL UNIQUE,
  display_name text NOT NULL,
  city text NOT NULL DEFAULT 'Atlanta, GA',
  tagline text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  accent text NOT NULL DEFAULT 'signal',
  contact_email text,
  links jsonb NOT NULL DEFAULT '[]'::jsonb,
  rights_statement text NOT NULL DEFAULT 'All works remain the exclusive property of the creator. Earth Protection Society holds a revocable, non-exclusive distribution license only.',
  platform_share_bps integer NOT NULL DEFAULT 1500,
  published boolean NOT NULL DEFAULT false,
  invite_id uuid REFERENCES public.creator_invites(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_pages TO authenticated;
GRANT SELECT ON public.creator_pages TO anon;
GRANT ALL ON public.creator_pages TO service_role;
ALTER TABLE public.creator_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published creator pages are public" ON public.creator_pages
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Creators read own page" ON public.creator_pages
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Creators update own page" ON public.creator_pages
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Creators delete own page" ON public.creator_pages
  FOR DELETE TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Admins read all creator pages" ON public.creator_pages
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_creator_pages_updated_at
  BEFORE UPDATE ON public.creator_pages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------- items
CREATE TABLE IF NOT EXISTS public.creator_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid NOT NULL REFERENCES public.creator_pages(id) ON DELETE CASCADE,
  owner_user_id uuid NOT NULL,
  kind text NOT NULL DEFAULT 'audio',
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  license_terms text NOT NULL DEFAULT '',
  price_cents integer,
  master_path text,
  master_format text,
  master_bytes bigint,
  preview_path text,
  artwork_path text,
  duration_seconds numeric,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS creator_items_page_id_idx ON public.creator_items (page_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.creator_items TO authenticated;
GRANT SELECT ON public.creator_items TO anon;
GRANT ALL ON public.creator_items TO service_role;
ALTER TABLE public.creator_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published items of published pages are public" ON public.creator_items
  FOR SELECT TO anon, authenticated
  USING (
    published = true
    AND EXISTS (
      SELECT 1 FROM public.creator_pages p
      WHERE p.id = creator_items.page_id AND p.published = true
    )
  );
CREATE POLICY "Creators read own items" ON public.creator_items
  FOR SELECT TO authenticated USING (owner_user_id = auth.uid());
CREATE POLICY "Creators insert own items" ON public.creator_items
  FOR INSERT TO authenticated WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Creators update own items" ON public.creator_items
  FOR UPDATE TO authenticated
  USING (owner_user_id = auth.uid()) WITH CHECK (owner_user_id = auth.uid());
CREATE POLICY "Creators delete own items" ON public.creator_items
  FOR DELETE TO authenticated USING (owner_user_id = auth.uid());

CREATE TRIGGER update_creator_items_updated_at
  BEFORE UPDATE ON public.creator_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ---------------------------------------------------------------- storage
CREATE POLICY "Creators manage own master files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'creator-masters' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'creator-masters' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Creators manage own preview files" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'creator-previews' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'creator-previews' AND (storage.foldername(name))[1] = auth.uid()::text);