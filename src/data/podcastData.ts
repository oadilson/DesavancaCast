import { Podcast, Episode, AudioTrail } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';

// Esta URL RSS será usada pelo administrador para sincronizar seu podcast.
// Idealmente, deveria ser configurável pelo administrador no futuro.
const ADMIN_RSS_FEED_URL = 'https://anchor.fm/s/10458b6b4/podcast/rss';

/**
 * Função para o administrador sincronizar e obter os dados do podcast.
 * Invoca uma Edge Function que busca o RSS e faz o upsert no banco de dados.
 */
export async function syncAndGetPodcastForAdmin(): Promise<Podcast | null> {
  const { data, error } = await supabase.functions.invoke('sync-and-get-podcast', {
    body: { rssFeedUrl: ADMIN_RSS_FEED_URL },
  });

  if (error) {
    console.error('Erro ao invocar a função sync-and-get-podcast:', error);
    let errorMessage = `Falha na comunicação com o servidor: ${error.message}`;

    if (error.context?.body) {
      try {
        const errorBody = JSON.parse(error.context.body);
        if (errorBody.error) {
          errorMessage = errorBody.error;
        }
      } catch (parseError) {
        console.warn('Não foi possível analisar o corpo do erro da Edge Function:', parseError);
      }
    }
    throw new Error(errorMessage);
  }

  if (data === null) {
    return null;
  }

  const formattedData: Podcast = {
    ...data,
    coverImage: data.cover_image,
    monthly_listeners: data.monthly_listeners,
    episodes: data.episodes.map((ep: any) => ({
      ...ep,
      coverImage: ep.cover_image,
      audioUrl: ep.audio_url,
      releaseDate: ep.release_date,
      isEdited: ep.is_edited,
    })),
  };

  return formattedData;
}

/**
 * Nova função para buscar dados do podcast para exibição pública (não-admin).
 * Busca diretamente do banco de dados sem tentar sincronizar.
 */
export async function getPodcastForDisplay(): Promise<Podcast | null> {
  // Busca o podcast principal pelo seu URL RSS de administração.
  // Em um cenário com múltiplos podcasts, seria necessário um mecanismo para identificar o "principal".
  const { data, error } = await supabase
    .from('podcasts')
    .select(`
      id,
      title,
      host,
      description,
      cover_image,
      monthly_listeners,
      episodes (
        id,
        title,
        description,
        duration,
        release_date,
        audio_url,
        cover_image,
        is_edited,
        newsletter_content,
        newsletter_subtitle,
        podcast_id,
        guid,
        is_premium
      )
    `)
    .eq('rss_feed_url', ADMIN_RSS_FEED_URL)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = nenhuma linha encontrada
    console.error('Error fetching podcast for display:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const formattedData: Podcast = {
    ...data,
    coverImage: data.cover_image,
    monthly_listeners: data.monthly_listeners,
    episodes: data.episodes.map((ep: any) => ({
      ...ep,
      coverImage: ep.cover_image,
      audioUrl: ep.audio_url,
      releaseDate: ep.release_date,
      isEdited: ep.is_edited,
    })),
  };

  return formattedData;
}

export async function getPodcastByUserId(userId: string): Promise<Podcast | null> {
  const { data, error } = await supabase
    .from('podcasts')
    .select(`*, episodes (*)`)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found, which is not an error here
    console.error('Error fetching podcast by user id:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const formattedData: Podcast = {
    ...data,
    coverImage: data.cover_image,
    monthly_listeners: data.monthly_listeners,
    episodes: data.episodes.map((ep: any) => ({
      ...ep,
      coverImage: ep.cover_image,
      audioUrl: ep.audio_url,
      releaseDate: ep.release_date,
      isEdited: ep.is_edited,
    })),
  };

  return formattedData;
}

export async function getAudioTrails(): Promise<AudioTrail[]> {
  const { data, error } = await supabase
    .from('audio_trails')
    .select(`
          id,
          title,
          description,
          cover_image,
          episodes:audio_trail_episodes (
            order,
            details:episodes (
              id,
              title,
              description,
              duration,
              release_date,
              audio_url,
              cover_image,
              is_edited,
              newsletter_content,
              newsletter_subtitle,
              podcast_id,
              guid,
              is_premium
            )
          )
        `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching audio trails:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  const formattedTrails: AudioTrail[] = data.map(trail => ({
    id: trail.id,
    title: trail.title,
    description: trail.description,
    cover_image: trail.cover_image,
    episodes: trail.episodes
      .sort((a, b) => a.order - b.order)
      .map((item: any) => ({
        ...item.details,
        coverImage: item.details.cover_image,
        audioUrl: item.details.audio_url,
        releaseDate: item.details.release_date,
        isEdited: item.details.is_edited,
      }))
  }));

  return formattedTrails;
}

export async function searchEpisodes(searchTerm: string): Promise<Episode[]> {
  if (!searchTerm.trim()) {
    return [];
  }
  const { data, error } = await supabase
    .rpc('search_episodes', { search_term: searchTerm });

  if (error) {
    console.error('Error searching episodes:', error);
    throw new Error(error.message);
  }

  return data.map((ep: any) => ({
    ...ep,
    coverImage: ep.cover_image,
    audioUrl: ep.audio_url,
    releaseDate: ep.release_date,
    isEdited: ep.is_edited,
  }));
}

export async function addLikedEpisode(episodeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('liked_episodes')
    .insert({ user_id: userId, episode_id: episodeId });
  if (error) throw error;
}

export async function removeLikedEpisode(episodeId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('liked_episodes')
    .delete()
    .eq('user_id', userId)
    .eq('episode_id', episodeId);
  if (error) throw error;
}

export async function fetchLikedEpisodeIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('liked_episodes')
    .select('episode_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(item => item.episode_id);
}

export async function fetchEpisodesByIds(episodeIds: string[]): Promise<Episode[]> {
  if (episodeIds.length === 0) return [];
  const { data, error } = await supabase
    .from('episodes')
    .select(`
      id,
      title,
      description,
      duration,
      release_date,
      audio_url,
      cover_image,
      is_edited,
      newsletter_content,
      newsletter_subtitle,
      podcast_id,
      guid,
      is_premium
    `)
    .in('id', episodeIds)
    .order('release_date', { ascending: false });

  if (error) throw error;

  return data.map((ep: any) => ({
    ...ep,
    coverImage: ep.cover_image,
    audioUrl: ep.audio_url,
    releaseDate: ep.release_date,
    isEdited: ep.is_edited,
  }));
}

export async function getEpisodeById(episodeId: string): Promise<Episode | null> {
  const { data, error } = await supabase
    .from('episodes')
    .select(`*, podcasts(title, host, cover_image)`)
    .eq('id', episodeId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching episode by ID:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return null;
  }

  const formattedEpisode: Episode = {
    ...data,
    coverImage: data.cover_image || data.podcasts?.cover_image || '/placeholder.svg',
    audioUrl: data.audio_url,
    releaseDate: data.release_date,
    isEdited: data.is_edited,
    host: data.podcasts?.host,
    podcastTitle: data.podcasts?.title,
  };

  return formattedEpisode;
}

export async function addLikedPodcast(podcastId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('liked_podcasts')
    .insert({ user_id: userId, podcast_id: podcastId });
  if (error) throw error;
}

export async function removeLikedPodcast(podcastId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('liked_podcasts')
    .delete()
    .eq('user_id', userId)
    .eq('podcast_id', podcastId);
  if (error) throw error;
}

export async function fetchLikedPodcastIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('liked_podcasts')
    .select('podcast_id')
    .eq('user_id', userId);
  if (error) throw error;
  return data.map(item => item.podcast_id);
}

export async function getPopularEpisodes(podcastId: string): Promise<Episode[]> {
  if (!podcastId) return [];
  const { data, error } = await supabase
    .rpc('get_popular_episodes', { p_podcast_id: podcastId });

  if (error) {
    console.error('Error fetching popular episodes:', error);
    throw new Error(error.message);
  }

  return data.map((ep: any) => ({
    ...ep,
    coverImage: ep.cover_image,
    audioUrl: ep.audio_url,
    releaseDate: ep.release_date,
    isEdited: ep.is_edited,
  }));
}

export async function getUnplayedEpisodes(podcastId: string, userId: string): Promise<Episode[]> {
  if (!podcastId || !userId) return [];
  const { data, error } = await supabase
    .rpc('get_unplayed_episodes', { p_podcast_id: podcastId, p_user_id: userId });

  if (error) {
    console.error('Error fetching unplayed episodes:', error);
    throw new Error(error.message);
  }

  return data.map((ep: any) => ({
    ...ep,
    coverImage: ep.cover_image,
    audioUrl: ep.audio_url,
    releaseDate: ep.release_date,
    isEdited: ep.is_edited,
  }));
}

export async function fetchRecentPlays(userId: string): Promise<Episode[]> {
  if (!userId) return [];

  const { data, error } = await supabase
    .from('plays')
    .select(`
      episode_id,
      played_at,
      episodes (
        id,
        title,
        description,
        duration,
        release_date,
        audio_url,
        cover_image,
        is_edited,
        newsletter_content,
        newsletter_subtitle,
        podcast_id,
        guid,
        is_premium,
        podcasts(title, host, cover_image)
      )
    `)
    .eq('user_id', userId)
    .order('played_at', { ascending: false });

  if (error) {
    console.error('Error fetching recent plays:', error);
    throw new Error(error.message);
  }

  if (!data) {
    return [];
  }

  const recentEpisodes: Episode[] = data
    .filter(play => play.episodes !== null)
    .map((play: any) => ({
      id: play.episodes.id,
      title: play.episodes.title,
      description: play.episodes.description,
      duration: play.episodes.duration,
      releaseDate: play.episodes.release_date,
      audioUrl: play.episodes.audio_url,
      coverImage: play.episodes.cover_image || play.episodes.podcasts?.cover_image || '/placeholder.svg',
      podcast_id: play.episodes.podcast_id,
      guid: play.episodes.guid,
      is_edited: play.episodes.is_edited,
      newsletter_content: play.episodes.newsletter_content,
      newsletter_subtitle: play.episodes.newsletter_subtitle,
      is_premium: play.episodes.is_premium,
      host: play.episodes.podcasts?.host,
      podcastTitle: play.episodes.podcasts?.title,
    }));

  return recentEpisodes;
}

export interface PodcastAnalytics {
  totalPlays: number;
  uniqueListeners: number;
  averagePlayTime: string;
  topEpisodes: { rank: number; title: string; plays: number }[];
  playsByCountry: { country: string; count: number }[]; // NOVO: Dados de reprodução por país
}

export async function getPodcastAnalytics(podcastId: string): Promise<PodcastAnalytics> {
  if (!podcastId) {
    return {
      totalPlays: 0,
      uniqueListeners: 0,
      averagePlayTime: "0 min",
      topEpisodes: [],
      playsByCountry: [],
    };
  }

  const { data, error } = await supabase.functions.invoke('get-podcast-analytics', {
    body: { podcast_id: podcastId },
  });

  if (error) {
    console.error('Error invoking get-podcast-analytics Edge Function:', error);
    throw new Error(`Falha ao carregar analytics: ${error.message}`);
  }

  return data as PodcastAnalytics;
}