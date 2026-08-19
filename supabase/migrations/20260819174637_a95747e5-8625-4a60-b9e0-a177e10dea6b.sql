
ALTER TABLE public.producers
  ADD COLUMN platform_share_bps INTEGER NOT NULL DEFAULT 1500
    CHECK (platform_share_bps >= 0 AND platform_share_bps <= 10000);

ALTER TABLE public.producer_orders
  ADD COLUMN platform_fee_cents INTEGER NOT NULL DEFAULT 0 CHECK (platform_fee_cents >= 0),
  ADD COLUMN producer_payout_cents INTEGER NOT NULL DEFAULT 0 CHECK (producer_payout_cents >= 0);
