
CREATE TABLE public.producers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Atlanta, GA',
  tagline TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  accent TEXT NOT NULL DEFAULT 'signal',
  published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.producer_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'beat',
  description TEXT NOT NULL DEFAULT '',
  license_terms TEXT NOT NULL DEFAULT '',
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  bpm INTEGER,
  song_key TEXT,
  preview_url TEXT,
  artwork_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.producer_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.producers(id) ON DELETE RESTRICT,
  buyer_email TEXT NOT NULL,
  buyer_name TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
  status TEXT NOT NULL DEFAULT 'pending',
  checkout_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX producer_products_producer_idx ON public.producer_products(producer_id);
CREATE INDEX producer_orders_producer_idx ON public.producer_orders(producer_id);

GRANT SELECT ON public.producers TO anon, authenticated;
GRANT ALL ON public.producers TO service_role;
GRANT SELECT ON public.producer_products TO anon, authenticated;
GRANT ALL ON public.producer_products TO service_role;
GRANT ALL ON public.producer_orders TO service_role;

ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.producer_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published producers are public" ON public.producers
  FOR SELECT TO anon, authenticated USING (published = true);

CREATE POLICY "Published products of published producers are public" ON public.producer_products
  FOR SELECT TO anon, authenticated USING (
    published = true AND EXISTS (
      SELECT 1 FROM public.producers p WHERE p.id = producer_id AND p.published = true
    )
  );

INSERT INTO public.producers (slug, display_name, city, tagline, bio, accent, published) VALUES
('ceelo-green', 'CeeLo Green', 'Atlanta, GA',
 'Soul-forward production, licensed direct from the room it was cut in.',
 'CeeLo Green has been shaping Atlanta''s sound since the Dungeon Family era — Goodie Mob, Gnarls Barkley, and a catalog of records built on live players, tube warmth, and gospel-trained arrangement. This storefront licenses beats, stems and drum kits mastered at 432Hz and delivered uncompressed, with the split written in the artist''s favor.',
 'signal', true);

INSERT INTO public.producer_products (producer_id, title, kind, description, license_terms, price_cents, bpm, song_key, sort_order)
SELECT p.id, v.title, v.kind, v.description, v.license_terms, v.price_cents, v.bpm, v.song_key, v.sort_order
FROM public.producers p, (VALUES
  ('Peachtree Gospel', 'beat', 'Live Rhodes, tambourine and a choir stack cut in one pass at the Block 12 room.', 'Non-exclusive license · unlimited streams · trackouts included', 14900, 82, 'F minor', 1),
  ('Dungeon Dust', 'beat', 'Dusty SP-1200 chop with upright bass and hand percussion. Uncompressed WAV master.', 'Non-exclusive license · unlimited streams · trackouts included', 12900, 91, 'C minor', 2),
  ('Southern Gothic (Exclusive)', 'exclusive', 'One-owner exclusive. Full transfer of master and publishing split terms negotiated at checkout.', 'Exclusive transfer · beat removed from store on sale', 250000, 74, 'D minor', 3),
  ('Green Room Drum Kit', 'drum kit', '212 one-shots and 40 loops recorded off tape, 24-bit / 96 kHz.', 'Royalty-free for commercial use · no resale of raw samples', 5900, NULL, NULL, 4),
  ('Gnarls Vocal Chain Preset Pack', 'kit', 'The console and outboard chain settings behind the vocal sound, mapped for modern DAWs.', 'Single-user license · unlimited projects', 3900, NULL, NULL, 5)
) AS v(title, kind, description, license_terms, price_cents, bpm, song_key, sort_order)
WHERE p.slug = 'ceelo-green';
