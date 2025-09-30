-- Enable Row Level Security for the 'podcasts' table
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow authenticated users to view all podcasts (public display)
DROP POLICY IF EXISTS "Allow authenticated users to view all podcasts" ON public.podcasts;
CREATE POLICY "Allow authenticated users to view all podcasts"
ON public.podcasts FOR SELECT
TO authenticated
USING (true);

-- Policy 2: Allow owners to insert their own podcast
DROP POLICY IF EXISTS "Allow owners to insert their own podcast" ON public.podcasts;
CREATE POLICY "Allow owners to insert their own podcast"
ON public.podcasts FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow owners to update their own podcast
DROP POLICY IF EXISTS "Allow owners to update their own podcast" ON public.podcasts;
CREATE POLICY "Allow owners to update their own podcast"
ON public.podcasts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); -- Prevents changing ownership

-- Policy 4: Allow owners to delete their own podcast
DROP POLICY IF EXISTS "Allow owners to delete their own podcast" ON public.podcasts;
CREATE POLICY "Allow owners to delete their own podcast"
ON public.podcasts FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Enable Row Level Security for the 'episodes' table
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Policy 5: Allow authenticated users to view all episodes (public display)
DROP POLICY IF EXISTS "Allow authenticated users to view all episodes" ON public.episodes;
CREATE POLICY "Allow authenticated users to view all episodes"
ON public.episodes FOR SELECT
TO authenticated
USING (true);

-- Policy 6: Allow podcast owners to manage their episodes (insert, update, delete)
DROP POLICY IF EXISTS "Allow podcast owners to manage their episodes" ON public.episodes;
CREATE POLICY "Allow podcast owners to manage their episodes"
ON public.episodes FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND user_id = auth.uid()));

-- Enable Row Level Security for the 'audio_trails' table
ALTER TABLE public.audio_trails ENABLE ROW LEVEL SECURITY;

-- Policy 7: Allow authenticated users to view all audio trails
DROP POLICY IF EXISTS "Allow authenticated users to view all audio trails" ON public.audio_trails;
CREATE POLICY "Allow authenticated users to view all audio trails"
ON public.audio_trails FOR SELECT
TO authenticated
USING (true);

-- Policy 8: Allow owners to manage their own audio trails
DROP POLICY IF EXISTS "Allow owners to manage their own audio trails" ON public.audio_trails;
CREATE POLICY "Allow owners to manage their own audio trails"
ON public.audio_trails FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security for the 'audio_trail_episodes' table
ALTER TABLE public.audio_trail_episodes ENABLE ROW LEVEL SECURITY;

-- Policy 9: Allow authenticated users to view all audio trail episodes
DROP POLICY IF EXISTS "Allow authenticated users to view all audio trail episodes" ON public.audio_trail_episodes;
CREATE POLICY "Allow authenticated users to view all audio trail episodes"
ON public.audio_trail_episodes FOR SELECT
TO authenticated
USING (true);

-- Policy 10: Allow audio trail owners to manage their audio trail episodes
DROP POLICY IF EXISTS "Allow audio trail owners to manage their audio trail episodes" ON public.audio_trail_episodes;
CREATE POLICY "Allow audio trail owners to manage their audio trail episodes"
ON public.audio_trail_episodes FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.audio_trails WHERE id = trail_id AND user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.audio_trails WHERE id = trail_id AND user_id = auth.uid()));

-- Enable Row Level Security for the 'liked_episodes' table
ALTER TABLE public.liked_episodes ENABLE ROW LEVEL SECURITY;

-- Policy 11: Allow users to manage their own liked episodes
DROP POLICY IF EXISTS "Allow users to manage their own liked episodes" ON public.liked_episodes;
CREATE POLICY "Allow users to manage their own liked episodes"
ON public.liked_episodes FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security for the 'liked_podcasts' table
ALTER TABLE public.liked_podcasts ENABLE ROW LEVEL SECURITY;

-- Policy 12: Allow users to manage their own liked podcasts
DROP POLICY IF EXISTS "Allow users to manage their own liked podcasts" ON public.liked_podcasts;
CREATE POLICY "Allow users to manage their own liked podcasts"
ON public.liked_podcasts FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Enable Row Level Security for the 'plays' table
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- Policy 13: Allow users to insert their own plays
DROP POLICY IF EXISTS "Allow users to insert their own plays" ON public.plays;
CREATE POLICY "Allow users to insert their own plays"
ON public.plays FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 14: Allow users to view their own plays
DROP POLICY IF EXISTS "Allow users to view their own plays" ON public.plays;
CREATE POLICY "Allow users to view their own plays"
ON public.plays FOR SELECT
TO authenticated
USING (auth.uid() = user_id);