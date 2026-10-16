CREATE TABLE IF NOT EXISTS public.blocked_profiles (
  blocker_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  blocked_id text NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT blocked_profiles_no_self CHECK (blocker_id <> blocked_id)
);

CREATE INDEX IF NOT EXISTS blocked_profiles_blocked_idx
  ON public.blocked_profiles (blocked_id, blocker_id);

ALTER TABLE public.reports
  ADD COLUMN IF NOT EXISTS reported_profile_id text REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reports_reported_profile_created_idx
  ON public.reports (reported_profile_id, created_at DESC);
