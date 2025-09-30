import React from 'react';
import Layout from '@/components/Layout';
import { Heart, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchEpisodesByIds } from '@/data/podcastData';
import EpisodeList from '@/components/EpisodeList';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLikedEpisodes } from '@/hooks/use-liked-episodes';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import EpisodeListItem from '@/components/EpisodeListItem'; // Import EpisodeListItem

const LikedEpisodes: React.FC = () => {
  const { likedEpisodeIds, isLoadingLiked, userId } = useLikedEpisodes();

  const { data: likedEpisodes = [], isLoading: isLoadingEpisodes, isError, error } = useQuery({
    queryKey: ['likedEpisodes', userId, Array.from(likedEpisodeIds)],
    queryFn: () => fetchEpisodesByIds(Array.from(likedEpisodeIds)),
    enabled: !!userId && !isLoadingLiked,
  });

  const isMobile = useIsMobile(); // Use the hook

  if (isLoadingLiked || isLoadingEpisodes) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando episódios curtidos...</span>
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full text-red-400 bg-red-900/20 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-bold mb-2">Ocorreu um Erro</p>
          <p className="text-sm text-red-300 text-center">Não foi possível carregar seus episódios curtidos.</p>
          {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="">
          <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
            <Heart className="mr-3 h-7 w-7 text-podcast-green" />
            Episódios Curtidos
          </h1>
          {likedEpisodes.length > 0 ? (
            isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {likedEpisodes.map((episode) => (
                  <EpisodeListItem key={episode.id} episode={episode} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <EpisodeList episodes={likedEpisodes} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <Heart className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum episódio curtido</p>
              <p className="text-sm text-podcast-gray text-center">
                Curta seus episódios favoritos para vê-los aqui.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default LikedEpisodes;