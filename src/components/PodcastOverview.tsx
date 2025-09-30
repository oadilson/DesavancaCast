import React, { useState, useMemo, useEffect } from 'react';
import { getPodcastForDisplay, getAudioTrails, getPopularEpisodes, getUnplayedEpisodes, getPodcastAnalytics } from '@/data/podcastData';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, PlayCircle, Loader2, AlertTriangle, Rss, Newspaper, Heart, Search, Share2, MoreHorizontal, Settings, Pause, Crown, Users, Headphones } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { formatDuration } from '@/lib/utils';
import { Episode } from '@/types/podcast';
import AudioTrails from './AudioTrails';
import { useLikedEpisodes } from '@/hooks/use-liked-episodes';
import { useLikedPodcast } from '@/hooks/use-liked-podcast';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import EditPodcastDetailsModal from './EditPodcastDetailsModal';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from './ui/badge';

const ADMIN_EMAIL = 'adilsonsilva@outlook.com';

type EpisodeFilter = 'recent' | 'popular' | 'oldest' | 'unplayed';

const PodcastOverview: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: myPodcast, isLoading, isError, error } = useQuery({
    queryKey: ['myPodcastDisplay'], // Chave de query alterada para a exibição pública
    queryFn: getPodcastForDisplay, // Usando a nova função para exibição
  });

  const { data: audioTrails, isLoading: isLoadingTrails } = useQuery({
    queryKey: ['audioTrailsHome'],
    queryFn: getAudioTrails,
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['podcastAnalyticsOverview', myPodcast?.id], // Chave de query específica para a overview
    queryFn: () => getPodcastAnalytics(myPodcast!.id),
    enabled: !!myPodcast?.id,
  });

  const { playEpisode, currentEpisode, isPlaying } = usePodcastPlayer();
  const { likedEpisodeIds, toggleLike, userId } = useLikedEpisodes();
  const { isPodcastLiked, toggleLikePodcast } = useLikedPodcast(myPodcast?.id);
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState<EpisodeFilter>('recent');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isEditPodcastModalOpen, setIsEditPodcastModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Removed: Global search state and handler from here

  const { data: popularEpisodes, isLoading: isLoadingPopular } = useQuery({
    queryKey: ['popularEpisodes', myPodcast?.id],
    queryFn: () => getPopularEpisodes(myPodcast!.id),
    enabled: activeFilter === 'popular' && !!myPodcast,
  });

  const { data: unplayedEpisodes, isLoading: isLoadingUnplayed } = useQuery({
    queryKey: ['unplayedEpisodes', myPodcast?.id, userId],
    queryFn: () => getUnplayedEpisodes(myPodcast!.id, userId!),
    enabled: activeFilter === 'unplayed' && !!myPodcast && !!userId,
  });

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === ADMIN_EMAIL) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleShare = async () => {
    if (!myPodcast) return;

    const shareData = {
      title: myPodcast.title,
      text: myPodcast.description,
      url: window.location.origin,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Erro ao compartilhar:', error);
          showError('Não foi possível compartilhar o podcast.');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.origin);
        showSuccess('Link do podcast copiado para a área de transferência!');
      } catch (error) {
        console.error('Erro ao copiar o link:', error);
        showError('Não foi possível copiar o link.');
      }
    }
  };

  const displayEpisodes = useMemo(() => {
    let episodes: Episode[] = [];

    if (activeFilter === 'popular') {
        episodes = popularEpisodes || [];
    } else if (activeFilter === 'unplayed' && userId) {
        episodes = unplayedEpisodes || [];
    } else if (myPodcast?.episodes) {
        episodes = [...myPodcast.episodes];
        if (activeFilter === 'oldest') {
            episodes.sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
        } else { // 'recent' ou fallback para 'unplayed' sem usuário
            episodes.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());
        }
    }

    if (localSearchTerm.trim()) {
      const lowerCaseSearchTerm = localSearchTerm.toLowerCase();
      return episodes.filter(
        (ep) =>
          ep.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          ep.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          (ep.newsletter_content && ep.newsletter_content.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    return episodes;
  }, [myPodcast?.episodes, activeFilter, popularEpisodes, unplayedEpisodes, localSearchTerm, userId]);

  const isFilterLoading = (isLoadingPopular && activeFilter === 'popular') || (isLoadingUnplayed && activeFilter === 'unplayed');

  const handlePodcastDetailsSave = () => {
    queryClient.invalidateQueries({ queryKey: ['myPodcastDisplay'] }); // Invalida a chave de exibição pública
    queryClient.invalidateQueries({ queryKey: ['myPodcastAdmin'] }); // Invalida a chave de admin também
    queryClient.invalidateQueries({ queryKey: ['podcastAnalyticsOverview'] }); // Invalida os analytics da overview
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-podcast-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Carregando podcast...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-red-400 bg-red-900/20 p-6 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-lg font-bold mb-2">Ocorreu um Erro</p>
        <p className="text-sm text-red-300 text-center">Não foi possível carregar os dados do podcast.</p>
        {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
      </div>
    );
  }

  if (!myPodcast) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
        <Rss className="h-12 w-12 mb-4 text-podcast-green" />
        <p className="text-lg font-bold mb-2">Nenhum Podcast Disponível</p>
        <p className="text-sm text-podcast-gray text-center">
          Parece que não há um podcast configurado para exibição.
          <br />
          Se você é o administrador, faça login e sincronize o feed RSS na página de administração.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section
        className="relative flex flex-col md:flex-row items-center md:items-end p-6 md:p-8 rounded-xl shadow-lg overflow-hidden"
        style={{ minHeight: '300px' }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center blur-lg scale-110"
          style={{
            backgroundImage: `url(${myPodcast.coverImage || '/placeholder.svg'})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-podcast-black to-transparent opacity-90"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-podcast-black via-podcast-black/70 to-transparent opacity-90"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end w-full space-y-6 md:space-y-0 md:space-x-8">
          <img
            src={myPodcast.coverImage}
            alt={myPodcast.title}
            className="w-32 h-32 sm:w-48 sm:h-48 rounded-xl object-cover shadow-xl flex-shrink-0"
          />
          <div className="text-center md:text-left flex-grow">
            <p className="text-sm font-semibold text-podcast-white mb-1 uppercase">Podcast</p>
            <h1 className="text-4xl sm:text-5xl font-bold text-podcast-white mb-2">{myPodcast.title}</h1>
            <p className="text-md text-podcast-gray mb-4 max-w-prose">{myPodcast.description}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-2 text-sm text-podcast-gray mb-6">
              <span>{myPodcast.host}</span>
              <span>•</span>
              <span>{myPodcast.episodes.length} episódio(s)</span>
              {myPodcast.monthly_listeners && (
                <>
                  <span>•</span>
                  <span>{myPodcast.monthly_listeners}</span>
                </>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 mt-4">
              {displayEpisodes[0] && (
                <Button
                  className="bg-podcast-green text-podcast-black hover:bg-podcast-green/90 rounded-full px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold shadow-podcast-glow"
                  onClick={() => playEpisode(displayEpisodes[0])}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Reproduzir
                </Button>
              )}
              {userId && (
                <Button
                  variant="outline"
                  className={cn(
                    "bg-transparent border-podcast-gray text-podcast-gray hover:bg-podcast-border hover:text-podcast-white rounded-full px-4 py-2 text-sm sm:px-6 sm:py-3 sm:text-base font-semibold",
                    isPodcastLiked && "bg-red-500 text-white border-red-500 hover:bg-red-600"
                  )}
                  onClick={toggleLikePodcast}
                >
                  <Heart className={`mr-2 h-5 w-5 ${isPodcastLiked ? 'fill-white' : ''}`} />
                  {isPodcastLiked ? 'Seguindo' : 'Seguir'}
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-podcast-gray hover:text-podcast-white hover:bg-podcast-border rounded-full" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-podcast-gray hover:text-podcast-white hover:bg-podcast-border rounded-full">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-podcast-gray hover:text-podcast-white hover:bg-podcast-border rounded-full"
                  onClick={() => setIsEditPodcastModalOpen(true)}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* NOVO: Resumo de Analytics */}
          {!isLoadingAnalytics && analytics && (
            <div className="hidden md:block md:w-1/3 lg:w-1/4 flex-shrink-0 p-4 bg-podcast-black-light/50 rounded-lg backdrop-blur-sm border border-podcast-border self-stretch flex flex-col justify-center">
              <h3 className="text-lg font-semibold text-podcast-white mb-3">Estatísticas Rápidas</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-podcast-gray"><PlayCircle className="h-4 w-4 mr-2 text-podcast-green" /> Reproduções Totais:</span>
                  <span className="font-bold text-podcast-white">{analytics.totalPlays}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-podcast-gray"><Users className="h-4 w-4 mr-2 text-podcast-green" /> Ouvintes Únicos:</span>
                  <span className="font-bold text-podcast-white">{analytics.uniqueListeners}</span>
                </div>
                {/* Adicione mais métricas se desejar */}
                <div className="text-center mt-4">
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      className="text-podcast-green hover:underline text-sm"
                      onClick={() => navigate('/admin?section=analytics')}
                    >
                      Ver Analytics Completos
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {isLoadingTrails ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-6 w-6 animate-spin text-podcast-white" />
        </div>
      ) : (
        <AudioTrails trails={audioTrails || []} />
      )}

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-podcast-white">
            Todos os Episódios <span className="text-podcast-gray text-base font-normal ml-2">{displayEpisodes.length} episódio(s)</span>
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button
              variant="ghost"
              className={cn(
                "rounded-full px-4 py-2 text-sm whitespace-nowrap",
                activeFilter === 'recent' ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90" : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white"
              )}
              onClick={() => setActiveFilter('recent')}
            >
              Mais recentes
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-full px-4 py-2 text-sm whitespace-nowrap",
                activeFilter === 'popular' ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90" : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white"
              )}
              onClick={() => setActiveFilter('popular')}
            >
              Mais populares
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-full px-4 py-2 text-sm whitespace-nowrap",
                activeFilter === 'oldest' ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90" : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white"
              )}
              onClick={() => setActiveFilter('oldest')}
            >
              Mais antigos
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "rounded-full px-4 py-2 text-sm whitespace-nowrap",
                activeFilter === 'unplayed' ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90" : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white"
              )}
              onClick={() => {
                if (!userId) {
                  showError('Você precisa estar logado para usar este filtro.');
                  return;
                }
                setActiveFilter('unplayed');
              }}
            >
              Não ouvidos
            </Button>
          </div>
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Buscar episódios..."
              className="w-full sm:w-64 bg-podcast-black-light border-none text-podcast-white placeholder:text-podcast-gray focus:ring-2 focus:ring-podcast-green/30 pr-10 rounded-full"
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-podcast-gray" />
          </div>
        </div>

        {isFilterLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          </div>
        ) : displayEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {displayEpisodes.map((episode) => {
              const isLiked = likedEpisodeIds.has(episode.id);
              const isCurrentEpisodePlaying = isPlaying && currentEpisode?.id === episode.id;
              return (
                <Card
                  key={episode.id}
                  className="bg-transparent border-none text-podcast-white hover:bg-podcast-black-light transition-colors group p-3 rounded-lg cursor-pointer"
                  onClick={() => {
                    navigate(`/episode/${episode.id}`);
                  }}
                >
                  <CardContent className="p-0">
                    <div className="relative mb-3 flex justify-center">
                      <img src={episode.coverImage || myPodcast.coverImage || '/placeholder.svg'} alt={episode.title} className="w-full rounded-lg object-cover aspect-square" />
                      {episode.is_premium && (
                        <Badge className="absolute bottom-2 left-2 bg-black/60 text-yellow-400 border-yellow-500/50 border text-xs backdrop-blur-sm">
                          <Crown className="h-3 w-3 mr-1.5" />
                          Premium
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-podcast-green text-podcast-black h-12 w-12 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-y-0 translate-y-2 hover:bg-podcast-green/90 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          playEpisode(episode);
                        }}
                      >
                        {isCurrentEpisodePlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                      </Button>
                      {userId && (
                        <Heart
                          className={`absolute top-2 right-2 h-6 w-6 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-podcast-gray hover:text-red-400'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLike(episode.id, isLiked);
                          }}
                        />
                      )}
                    </div>
                    <CardTitle className="text-md font-semibold truncate">{episode.title}</CardTitle>
                    <CardDescription className="text-sm text-podcast-gray mt-1">{new Date(episode.releaseDate).toLocaleDateString('pt-BR')} • {formatDuration(episode.duration)}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-40 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
            <Search className="h-12 w-12 mb-4 text-podcast-gray" />
            <p className="text-lg font-bold mb-2">Nenhum episódio encontrado</p>
            <p className="text-sm text-podcast-gray text-center">
              Tente refinar sua busca ou usar termos diferentes.
            </p>
          </div>
        )}
      </section>

      {myPodcast && (
        <EditPodcastDetailsModal
          isOpen={isEditPodcastModalOpen}
          onClose={() => setIsEditPodcastModalOpen(false)}
          onSave={handlePodcastDetailsSave}
          initialData={myPodcast}
        />
      )}
    </div>
  );
};

export default PodcastOverview;