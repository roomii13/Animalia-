CREATE TABLE profiles (
  id text PRIMARY KEY,
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  account_type text NOT NULL DEFAULT 'person' CHECK (account_type IN ('person', 'rescue_organization')),
  bio text,
  locality text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_username_format CHECK (username ~ '^[a-z0-9_]{3,30}$')
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('adoption', 'lost', 'rescue', 'help', 'event')),
  status text NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed', 'removed')),
  title varchar(120) NOT NULL,
  description varchar(3000) NOT NULL,
  locality varchar(120),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_feed_idx ON posts (status, created_at DESC);
CREATE INDEX posts_locality_idx ON posts (locality, created_at DESC);

CREATE TABLE follows (
  follower_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followed_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id),
  CONSTRAINT follows_no_self CHECK (follower_id <> followed_id)
);

CREATE TABLE saved_posts (
  profile_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (profile_id, post_id)
);

CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE conversation_members (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body varchar(4000) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX messages_conversation_idx ON messages (conversation_id, created_at);

CREATE TABLE reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id text NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  reason varchar(80) NOT NULL,
  details varchar(2000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
