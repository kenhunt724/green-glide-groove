ALTER TABLE public.creator_items
  ADD COLUMN IF NOT EXISTS ai_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_genre text,
  ADD COLUMN IF NOT EXISTS ai_mood text,
  ADD COLUMN IF NOT EXISTS ai_instruments text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ai_bpm integer,
  ADD COLUMN IF NOT EXISTS ai_key text,
  ADD COLUMN IF NOT EXISTS ai_summary text,
  ADD COLUMN IF NOT EXISTS ai_tagged_at timestamptz;

CREATE INDEX IF NOT EXISTS creator_items_ai_tags_idx ON public.creator_items USING gin (ai_tags);
CREATE INDEX IF NOT EXISTS creator_items_ai_instruments_idx ON public.creator_items USING gin (ai_instruments);