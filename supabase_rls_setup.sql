-- Enable RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audio_trail_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.liked_podcasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plays ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can delete their own profile." ON public.profiles FOR DELETE USING (auth.uid() = id);

-- RLS Policies for podcasts table
CREATE POLICY "Enable read access for all users" ON public.podcasts FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on their own podcasts" ON public.podcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users on their own podcasts" ON public.podcasts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own podcasts" ON public.podcasts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for episodes table
CREATE POLICY "Enable read access for all users" ON public.episodes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on their own episodes" ON public.episodes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND user_id = auth.uid()));
CREATE POLICY "Enable update for authenticated users on their own episodes" ON public.episodes FOR UPDATE USING (EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND user_id = auth.uid()));
CREATE POLICY "Enable delete for authenticated users on their own episodes" ON public.episodes FOR DELETE USING (EXISTS (SELECT 1 FROM public.podcasts WHERE id = podcast_id AND user_id = auth.uid()));

-- RLS Policies for audio_trails table
CREATE POLICY "Enable read access for all users on audio_trails" ON public.audio_trails FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on their own audio_trails" ON public.audio_trails FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update for authenticated users on their own audio_trails" ON public.audio_trails FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own audio_trails" ON public.audio_trails FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for audio_trail_episodes table
CREATE POLICY "Enable read access for all users on audio_trail_episodes" ON public.audio_trail_episodes FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users on their own audio_trail_episodes" ON public.audio_trail_episodes FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.audio_trails WHERE id = trail_id AND user_id = auth.uid()));
CREATE POLICY "Enable delete for authenticated users on their own audio_trail_episodes" ON public.audio_trail_episodes FOR DELETE USING (EXISTS (SELECT 1 FROM public.audio_trails WHERE id = trail_id AND user_id = auth.uid()));

-- RLS Policies for liked_episodes table
CREATE POLICY "Enable read access for authenticated users on their own liked_episodes" ON public.liked_episodes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users on their own liked_episodes" ON public.liked_episodes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own liked_episodes" ON public.liked_episodes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for liked_podcasts table
CREATE POLICY "Enable read access for authenticated users on their own liked_podcasts" ON public.liked_podcasts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users on their own liked_podcasts" ON public.liked_podcasts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable delete for authenticated users on their own liked_podcasts" ON public.liked_podcasts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for plays table
CREATE POLICY "Enable read access for authenticated users on their own plays" ON public.plays FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert for authenticated users on their own plays" ON public.plays FOR INSERT WITH CHECK (auth.uid() = user_id);