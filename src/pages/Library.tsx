import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Heart, Download, BarChart2, Loader2, AlertTriangle, ListMusic } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { getPodcastForDisplay } from '@/data/podcastData';
import EpisodeListItem from '@/components/EpisodeListItem';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import EpisodeList from '@/components/EpisodeList'; // Import EpisodeList
import LibraryCards from '@/components/LibraryCards'; // Importar o novo componente

const Library: React.FC = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const isMobile = useIsMobile(); // Use the hook

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
      setIsAdmin(session?.user?.email === 'adilsonsilva@outlook.com');
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      setIsAdmin(session?.user?.email === 'adilsonsilva@outlook.com');
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: myPodcast, isLoading, isError, error } = useQuery({
    queryKey: ['allEpisodesLibrary'],
    queryFn: getPodcastForDisplay,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando sua biblioteca...</span>
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
          <p className="text-sm text-red-300 text-center">Não foi possível carregar sua biblioteca.</p>
          {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
        </div>
      </Layout>
    );
  }

  const allEpisodes = myPodcast?.episodes.sort((a, b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime()) || [];

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-podcast-white mb-6">Sua Biblioteca</h1>

          {!isMobile && ( // Renderiza os cards apenas no desktop
            <LibraryCards userId={userId} isAdmin={isAdmin} />
          )}

          <h2 className="text-2xl font-bold text-podcast-white mt-8 mb-4 flex items-center">
            <ListMusic className="mr-2 h-6 w-6 text-podcast-green" />
            Todos os Episódios
          </h2>
          {allEpisodes.length > 0 ? (
            // Agora sempre usa EpisodeList, que já é responsivo
            <EpisodeList episodes={allEpisodes} podcastCoverImage={myPodcast?.coverImage} />
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
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

export default Library;