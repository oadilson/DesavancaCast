import { Podcast, Episode } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client'; // Importar o cliente Supabase

export async function fetchPodcastFromRss(rssFeedUrl: string): Promise<Podcast | null> {
  try {
    // Invocar a Edge Function do Supabase para buscar e analisar o RSS
    const { data, error } = await supabase.functions.invoke('fetch-rss', {
      body: { rssFeedUrl },
    });

    if (error) {
      console.error('Error invoking Supabase Edge Function:', error);
      return null;
    }

    const feed = data; // A Edge Function já retorna o feed analisado

    if (!feed || !feed.items || feed.items.length === 0) {
      console.warn('RSS feed is empty or could not be parsed by Edge Function:', rssFeedUrl);
      return null;
    }

    const podcast: Podcast = {
      id: feed.guid || feed.link || feed.title || 'unknown-podcast',
      title: feed.title || 'Podcast Desconhecido',
      host: feed.itunes?.author || feed.creator || 'Host Desconhecido',
      description: feed.description || feed.itunes?.summary || 'Nenhuma descrição disponível.',
      coverImage: feed.itunes?.image || feed.image?.url || '/placeholder.svg',
      episodes: feed.items.map((item: any): Episode => ({
        id: item.guid || item.link || item.title || `episode-${Math.random()}`,
        title: item.title || 'Episódio Sem Título',
        description: item.contentSnippet || item.content || 'Nenhuma descrição disponível.',
        duration: item.itunes?.duration || 'N/A',
        isPremium: item.itunes?.episodeType === 'bonus' || item.itunes?.episodeType === 'private',
        releaseDate: item.pubDate ? new Date(item.pubDate).toLocaleDateString('pt-BR') : 'Data Desconhecida',
        audioUrl: item.enclosure?.url || '',
        coverImage: item.itunes?.image || feed.itunes?.image || feed.image?.url || '/placeholder.svg', // Adicionado: imagem de capa do episódio
      })).filter((episode: Episode) => episode.audioUrl !== ''),
    };

    return podcast;
  } catch (error: any) {
    console.error('Error fetching or parsing RSS feed via Edge Function:', error.message);
    return null;
  }
}