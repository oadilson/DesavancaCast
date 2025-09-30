import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Search as SearchIcon, Loader2, AlertTriangle, ListMusic } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getPodcastForDisplay } from '@/data/podcastData';
import { ScrollArea } from '@/components/ui/scroll-area';
import EpisodeListItem from '@/components/EpisodeListItem';
import EpisodeList from '@/components/EpisodeList'; // Import EpisodeList
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile

const Search: React.FC = () => {
  const navigate = useNavigate();
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const isMobile = useIsMobile(); // Use the hook

  const { data: myPodcast, isLoading, isError, error } = useQuery({
    queryKey: ['allEpisodesForSearchPage'],
    queryFn: getPodcastForDisplay,
  });

  const handleLocalSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(localSearchTerm.trim())}`);
    }
  };

  const allEpisodes = myPodcast?.episodes.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()) || [];

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-podcast-white">Buscar Episódios</h1>

          <form onSubmit={handleLocalSearch} className="relative">
            <Input
              type="text"
              placeholder="Buscar episódios por título..."
              className="w-full bg-podcast-black-light border-none text-podcast-white placeholder:text-podcast-gray focus:ring-2 focus:ring-podcast-green/30 pr-10 rounded-full h-12 text-base"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-1/2 -translate-y-1/2 text-podcast-gray hover:text-podcast-white">
              <SearchIcon className="h-6 w-6" />
            </Button>
          </form>

          <h2 className="text-2xl font-bold text-podcast-white flex items-center">
            <ListMusic className="mr-2 h-6 w-6 text-podcast-green" />
            Episódios Recentes
          </h2>

          {isLoading && (
            <div className="flex justify-center items-center h-40 text-podcast-white">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              Carregando episódios...
            </div>
          )}

          {isError && (
            <div className="flex flex-col justify-center items-center h-40 text-red-400 bg-red-900/20 p-6 rounded-lg">
              <AlertTriangle className="h-12 w-12 mb-4" />
              <p className="text-lg font-bold mb-2">Ocorreu um Erro</p>
              <p className="text-sm text-red-300 text-center">Não foi possível carregar os episódios recentes.</p>
              {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
            </div>
          )}

          {!isLoading && !isError && allEpisodes.length > 0 ? (
            isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {allEpisodes.map((episode) => (
                  <EpisodeListItem key={episode.id} episode={episode} podcastCoverImage={myPodcast?.coverImage} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <EpisodeList episodes={allEpisodes} podcastCoverImage={myPodcast?.coverImage} />
            )
          ) : (!isLoading && !isError && allEpisodes.length === 0) ? (
            <div className="flex flex-col items-center justify-center h-40 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <ListMusic className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum episódio encontrado</p>
              <p className="text-sm text-podcast-gray text-center">
                Parece que não há episódios disponíveis no momento.
              </p>
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default Search;