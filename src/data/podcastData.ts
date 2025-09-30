import { Podcast, Episode, AudioTrail } from '@/types/podcast';
    import { supabase } from '@/integrations/supabase/client';

    // Altere esta URL para o feed RSS do podcast que você deseja gerenciar
    const RSS_FEED_URL = 'https://anchor.fm/s/10458b6b4/podcast/rss'; // Mantenha esta URL se você for o proprietário legítimo e limpou o DB

    export async function getMyPodcast(): Promise<Podcast | null> {
      const { data, error } = await supabase.functions.invoke('sync-and-get-podcast', {
        body: { rssFeedUrl: RSS_FEED_URL },
      });

      if (error) {
        console.error('Erro ao invocar a função sync-and-get-podcast:', error);
        let errorMessage = `Falha na comunicação com o servidor: ${error.message}`;

        // Tentar analisar a mensagem de erro detalhada do corpo da resposta da Edge Function
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

      // Se a função retornar null (podcast ainda não sincronizado), apenas repasse o null.
      if (data === null) {
        return null;
      }

      // O tipo de retorno da função precisa ser ajustado para corresponder à estrutura do banco de dados
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
              *
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

      // Formatar os dados para corresponder ao tipo AudioTrail
      const formattedTrails: AudioTrail[] = data.map(trail => ({
        id: trail.id,
        title: trail.title,
        description: trail.description,
        cover_image: trail.cover_image,
        episodes: trail.episodes
          .sort((a, b) => a.order - b.order)
          .map((item: any) => ({
            ...item.details,
            // Garantir que os nomes dos campos correspondam ao tipo Episode
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

    // Funções para gerenciar episódios curtidos
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
        .select('*')
        .in('id', episodeIds)
        .order('release_date', { ascending: false }); // Ordenar por data de lançamento

      if (error) throw error;

      return data.map((ep: any) => ({
        ...ep,
        coverImage: ep.cover_image,
        audioUrl: ep.audio_url,
        releaseDate: ep.release_date,
        isEdited: ep.is_edited,
      }));
    }

    // NOVO: Função para buscar um único episódio por ID
    export async function getEpisodeById(episodeId: string): Promise<Episode | null> {
      const { data, error } = await supabase
        .from('episodes')
        .select(`*, podcasts(title, host, cover_image)`) // Seleciona também dados do podcast pai
        .eq('id', episodeId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching episode by ID:', error);
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      // Formatar os dados para corresponder ao tipo Episode
      const formattedEpisode: Episode = {
        ...data,
        coverImage: data.cover_image || data.podcasts?.cover_image || '/placeholder.svg',
        audioUrl: data.audio_url,
        releaseDate: data.release_date,
        isEdited: data.is_edited,
        // Adicionar host e podcastTitle para exibição na página de detalhes
        host: data.podcasts?.host,
        podcastTitle: data.podcasts?.title,
      };

      return formattedEpisode;
    }


    // Funções para gerenciar curtidas de podcasts
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