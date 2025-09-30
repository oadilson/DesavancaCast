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

  const libraryCards = [
    {
      title: 'Ouvidos Recentemente',
      description: 'Continue de onde parou',
      icon: History,
      bgColor: 'bg-podcast-green',
      hoverBgColor: 'hover:bg-podcast-green/90',
      path: userId ? '/recent' : '/login',
    },
    {
      title: 'Favoritos',
      description: 'Seus episódios salvos',
      icon: Heart,
      bgColor: 'bg-podcast-purple',
      hoverBgColor: 'hover:bg-podcast-purple/90',
      path: userId ? '/liked' : '/login',
    },
    {
      title: 'Downloads',
      description: 'Ouça offline',
      icon: Download,
      bgColor: 'bg-blue-600',
      hoverBgColor: 'hover:bg-blue-700',
      path: userId ? '/downloads' : '/login',
    },
    {
      title: 'Estatísticas',
      description: 'Seu tempo de escuta',
      icon: BarChart2,
      bgColor: 'bg-orange-600',
      hoverBgColor: 'hover:bg-orange-700',
      path: isAdmin ? '/admin' : '/login',
      disabled: !isAdmin && !userId,
    },
  ];

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-podcast-white mb-6">Sua Biblioteca</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {libraryCards.map((card, index) => (
              <Link
                key={index}
                to={card.path}
                className={cn(
                  "block rounded-xl p-6 text-podcast-white transition-colors shadow-lg",
                  card.bgColor,
                  card.hoverBgColor,
                  card.disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              >
                <card.icon className="h-8 w-8 mb-3" />
                <CardTitle className="text-xl font-bold">{card.title}</CardTitle>
                <CardDescription className="text-sm text-white/80 mt-1">{card.description}</CardDescription>
              </Link>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-podcast-white mt-8 mb-4 flex items-center">
            <ListMusic className="mr-2 h-6 w-6 text-podcast-green" />
            Todos os Episódios
          </h2>
          {allEpisodes.length > 0 ? (
            isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {allEpisodes.map((episode) => (
                  <EpisodeListItem key={episode.id} episode={episode} podcastCoverImage={myPodcast?.coverImage} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <EpisodeList episodes={allEpisodes} podcastCoverImage={myPodcast?.coverImage} />
            )
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