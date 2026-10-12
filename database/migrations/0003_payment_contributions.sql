CREATE TABLE public.payment_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  idempotency_key varchar(128) NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  currency varchar(3) NOT NULL DEFAULT 'ARS' CHECK (currency = 'ARS'),
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'cancelled', 'refunded', 'review')),
  mp_order_id varchar(80) UNIQUE,
  mp_payment_id varchar(80),
  provider_status varchar(80),
  provider_status_detail varchar(120),
  checkout_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  UNIQUE (profile_id, idempotency_key)
);

CREATE INDEX payment_contributions_profile_created_idx
  ON public.payment_contributions (profile_id, created_at DESC);

CREATE TABLE public.payment_webhook_events (
  event_id varchar(256) PRIMARY KEY,
  mp_order_id varchar(80) NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
