ALTER TABLE public.payment_contributions
  ADD COLUMN purpose text NOT NULL DEFAULT 'general'
  CHECK (purpose IN ('general', 'pet_cemetery_land'));
