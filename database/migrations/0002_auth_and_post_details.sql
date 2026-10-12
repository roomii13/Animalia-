ALTER TABLE public.posts
  ADD COLUMN animal_name varchar(100),
  ADD COLUMN animal_species varchar(40),
  ADD COLUMN image_url text;

CREATE TABLE public.account_credentials (
  profile_id text PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  email varchar(320) NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT account_credentials_email_format CHECK (email = lower(email))
);

CREATE TABLE public.auth_sessions (
  token_hash text PRIMARY KEY,
  profile_id text NOT NULL REFERENCES public.account_credentials(profile_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auth_sessions_expiry_idx ON public.auth_sessions (expires_at);
