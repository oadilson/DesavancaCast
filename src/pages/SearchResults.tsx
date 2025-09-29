import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchEpisodes } from '@/data/podcastData';
import { Loader2, Search, AlertTriangle, PlayCircle, Newspaper, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { generateSlug, formatDuration } from '@/lib/utils';
import { Episode } from '@/types/podcast';
import { ScrollArea } from '@/components/ui/scroll-area';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('query') || '';
  const { playEpisode } = usePodcastPlayer();
  const navigate = useNavigate();

  const { data: episodes, isLoading, isError, error } = useQuery({
    queryKey: ['searchResults', searchTerm],
    queryFn: () => searchEpisodes(searchTerm),
    enabled: !!searchTerm,
  });

  const handleReadNewsletterClick = (episode: Episode, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/episode/${episode.id}`);
  };

  useEffect(() => {
    if (!searchTerm) {
      // navigate('/');
    }
  }, [searchTerm]);

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="container mx-auto max-w-screen-xl py-6 sm:py-10 px-6 sm:px-8 lg:px-12">
          <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
            <Search className="mr-3 h-7 w-7 text-podcast-green" />
            Resultados da Busca para "{searchTerm}"
          </h1>

          {isLoading && (
            <div className="flex justify-center items-center h-64 text-podcast-white">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Buscando episódios...
            </div>
          )}

          {isError && (
            <div className="flex flex-col justify-center items-center h-64 text-red-400 bg-red-900/20 p-6 rounded-lg">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-bold mb-2">Ocorreu um Erro na Busca</p>
              <p className="text-sm text-red-300 text-center">Não foi possível realizar a busca. Tente novamente mais tarde.</p>
              {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
            </div>
          )}

          {!isLoading && !isError && episodes && episodes.length === 0 && (
            <div className="flex flex-col justify-center items-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <Search className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum resultado encontrado</p>
              <p className="text-sm text-podcast-gray text-center">
                Tente refinar sua busca ou usar termos diferentes.
              </p>
            </div>
          )}

          {!isLoading && !isError && episodes && episodes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {episodes.map((episode) => (
                <Card
                  key={episode.id}
                  className="bg-transparent border-none text-podcast-white hover:bg-podcast-black-light transition-colors group p-3 cursor-pointer rounded-lg"
                  onClick={() => {
                    navigate(`/episode/${episode.id}`);
                  }}
                >
                  <CardContent className="p-0">
                    <div className="relative mb-3">
                      <img src={episode.coverImage || '/placeholder.svg'} alt={episode.title} className="w-full rounded-lg object-cover aspect-square" />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-podcast-green text-podcast-black h-12 w-12 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-0 translate-y-2 hover:bg-podcast-green/90 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEpisode(episode);
                        }}
                      >
                        <Play className="h-6 w-6 ml-1" />
                      </Button>
                    </div>
                    <CardTitle className="text-md font-semibold truncate">{episode.title}</CardTitle>
                    <CardDescription className="text-sm text-podcast-gray mt-1">{new Date(episode.releaseDate || '').toLocaleDateString('pt-BR')} • {formatDuration(episode.duration)}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default SearchResults;