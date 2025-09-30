import React, { useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchEpisodes } from '@/data/podcastData';
import { Loader2, Search, AlertTriangle } from 'lucide-react'; // Removed PlayCircle, Newspaper, Play
import { ScrollArea } from '@/components/ui/scroll-area';
import Layout from '@/components/Layout';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import EpisodeList from '@/components/EpisodeList'; // Import EpisodeList
import EpisodeListItem from '@/components/EpisodeListItem'; // Import EpisodeListItem

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('query') || '';
  const navigate = useNavigate();
  const isMobile = useIsMobile(); // Use the hook

  const { data: episodes, isLoading, isError, error } = useQuery({
    queryKey: ['searchResults', searchTerm],
    queryFn: () => searchEpisodes(searchTerm),
    enabled: !!searchTerm,
  });

  useEffect(() => {
    if (!searchTerm) {
      // navigate('/'); // Keep this commented out as per previous instructions
    }
  }, [searchTerm]);

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="">
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
            isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {episodes.map((episode) => (
                  <EpisodeListItem key={episode.id} episode={episode} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <EpisodeList episodes={episodes} />
            )
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default SearchResults;