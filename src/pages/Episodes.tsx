import React from 'react';
import Layout from '@/components/Layout';
import { ListMusic, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getMyPodcast } from '@/data/podcastData';
import EpisodeList from '@/components/EpisodeList';
import { ScrollArea } from '@/components/ui/scroll-area';

const Episodes: React.FC = () => {
  const { data: myPodcast, isLoading, isError, error } = useQuery({
    queryKey: ['allEpisodes'],
    queryFn: getMyPodcast,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando episódios...</span>
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
          <p className="text-sm text-red-300 text-center">Não foi possível carregar os episódios.</p>
          {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
        </div>
      </Layout>
    );
  }

  const allEpisodes = myPodcast?.episodes.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()) || [];

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="container mx-auto max-w-screen-xl py-6 sm:py-10 px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
            <ListMusic className="mr-3 h-7 w-7 text-podcast-green" />
            Todos os Episódios
          </h1>
          {allEpisodes.length > 0 ? (
            <EpisodeList episodes={allEpisodes} podcastCoverImage={myPodcast?.coverImage} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <ListMusic className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum episódio encontrado</p>
              <p className="text-sm text-podcast-gray text-center">
                Parece que não há episódios disponíveis no momento.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default Episodes;