-- Create profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    first_name text,
    last_name text,
    avatar_url text,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create podcasts table
CREATE TABLE public.podcasts (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    rss_feed_url text UNIQUE NOT NULL,
    title text,
    host text,
    description text,
    cover_image text,
    monthly_listeners text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_edited boolean DEFAULT false NOT NULL
);

-- Create episodes table
CREATE TABLE public.episodes (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    podcast_id uuid REFERENCES public.podcasts ON DELETE CASCADE NOT NULL,
    guid text NOT NULL,
    title text,
    description text,
    duration text,
    release_date timestamp with time zone,
    audio_url text,
    cover_image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    is_edited boolean DEFAULT false NOT NULL,
    newsletter_content text,
    newsletter_subtitle text,
    CONSTRAINT unique_episode_per_podcast UNIQUE (podcast_id, guid)
);

-- Create audio_trails table
CREATE TABLE public.audio_trails (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    cover_image text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create audio_trail_episodes join table
CREATE TABLE public.audio_trail_episodes (
    trail_id uuid REFERENCES public.audio_trails ON DELETE CASCADE NOT NULL,
    episode_id uuid REFERENCES public.episodes ON DELETE CASCADE NOT NULL,
    "order" integer NOT NULL,
    PRIMARY KEY (trail_id, episode_id)
);

-- Create liked_episodes table
CREATE TABLE public.liked_episodes (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    episode_id uuid REFERENCES public.episodes ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, episode_id)
);

-- Create liked_podcasts table
CREATE TABLE public.liked_podcasts (
    user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    podcast_id uuid REFERENCES public.podcasts ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (user_id, podcast_id)
);

-- Create plays table
CREATE TABLE public.plays (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid REFERENCES auth.users ON DELETE SET NULL, -- Can be null if user deletes account
    episode_id uuid REFERENCES public.episodes ON DELETE CASCADE NOT NULL,
    played_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Create a trigger to create a profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'first_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create search_episodes RPC function
CREATE OR REPLACE FUNCTION public.search_episodes(search_term text)
RETURNS SETOF public.episodes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.episodes
  WHERE
    title ILIKE '%' || search_term || '%' OR
    description ILIKE '%' || search_term || '%';
END;
$$;

-- Create get_popular_episodes RPC function (mock for now)
CREATE OR REPLACE FUNCTION public.get_popular_episodes(p_podcast_id uuid)
RETURNS SETOF public.episodes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM public.episodes e
  WHERE e.podcast_id = p_podcast_id
  ORDER BY e.release_date DESC -- Placeholder: order by recent for now
  LIMIT 10;
END;
$$;

-- Create get_unplayed_episodes RPC function (mock for now)
CREATE OR REPLACE FUNCTION public.get_unplayed_episodes(p_podcast_id uuid, p_user_id uuid)
RETURNS SETOF public.episodes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT e.*
  FROM public.episodes e
  WHERE e.podcast_id = p_podcast_id
    AND NOT EXISTS (
      SELECT 1
      FROM public.plays p
      WHERE p.episode_id = e.id AND p.user_id = p_user_id
    )
  ORDER BY e.release_date DESC;
END;
$$;