import React from 'react';
import Layout from '@/components/Layout';
import { TrendingUp, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getPodcastForDisplay, getPopularEpisodes } from '@/data/podcastData'; // Importar getPopularEpisodes
import EpisodeList from '@/components/EpisodeList';
import { ScrollArea } from '@/components/ui/scroll-area';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Remover import
// import { Info } from 'lucide-react'; // Remover import

const Popular: React.FC = () => {
  const { data: myPodcast, isLoading: isLoadingPodcast, isError: isErrorPodcast, error: errorPodcast } = useQuery({
    queryKey: ['podcastForPopularPage'],
    queryFn: getPodcastForDisplay,
  });

  const { data: popularEpisodes = [], isLoading: isLoadingPopular, isError: isErrorPopular, error: errorPopular } = useQuery({
    queryKey: ['popularEpisodes', myPodcast?.id],
    queryFn: () => getPopularEpisodes(myPodcast!.id),
    enabled: !!myPodcast?.id, // Só executa a query se o ID do podcast estiver disponível
  });

  if (isLoadingPodcast || isLoadingPopular) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando episódios populares...</span>
        </div>
      </Layout>
    );
  }

  if (isErrorPodcast || isErrorPopular) {
    const errorMessage = errorPodcast?.message || errorPopular?.message || 'Erro desconhecido';
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full text-red-400 bg-red-900/20 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-bold mb-2">Ocorreu um Erro</p>
          <p className="text-sm text-red-300 text-center">Não foi possível carregar os episódios populares.</p>
          <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {errorMessage}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className=""> {/* Removido max-w-screen-xl mx-auto */}
          <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
            <TrendingUp className="mr-3 h-7 w-7 text-podcast-green" />
            Mais Populares
          </h1>
          {/* O alerta "Em Desenvolvimento" foi removido */}
          {popularEpisodes.length > 0 ? (
            <EpisodeList episodes={popularEpisodes} podcastCoverImage={myPodcast?.coverImage} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <TrendingUp className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum episódio popular encontrado</p>
              <p className="text-sm text-podcast-gray text-center">
                Parece que não há episódios populares disponíveis no momento.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default Popular;