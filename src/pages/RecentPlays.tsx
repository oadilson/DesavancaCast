import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { History, Loader2, AlertTriangle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchRecentPlays } from '@/data/podcastData';
import EpisodeList from '@/components/EpisodeList';
import { ScrollArea } => '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import EpisodeListItem from '@/components/EpisodeListItem'; // Import EpisodeListItem

const RecentPlays: React.FC = () => {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: recentPlays = [], isLoading, isError, error } = useQuery({
    queryKey: ['recentPlays', userId],
    queryFn: () => fetchRecentPlays(userId!),
    enabled: !!userId,
  });

  const isMobile = useIsMobile(); // Use the hook

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando histórico de reprodução...</span>
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
          <p className="text-sm text-red-300 text-center">Não foi possível carregar seu histórico de reprodução.</p>
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
            <History className="mr-3 h-7 w-7 text-podcast-green" />
            Reproduzidos Recentemente
          </h1>
          {recentPlays.length > 0 ? (
            isMobile ? (
              <div className="grid grid-cols-1 gap-4">
                {recentPlays.map((episode) => (
                  <EpisodeListItem key={episode.id} episode={episode} isMobile={isMobile} />
                ))}
              </div>
            ) : (
              <EpisodeList episodes={recentPlays} />
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
              <History className="h-12 w-12 mb-4 text-podcast-gray" />
              <p className="text-lg font-bold mb-2">Nenhum episódio reproduzido recentemente</p>
              <p className="text-sm text-podcast-gray text-center">
                Comece a ouvir para ver seu histórico aqui.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default RecentPlays;