import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEpisodeById } from '@/data/podcastData';
import Layout from '@/components/Layout';
import { Loader2, AlertTriangle, PlayCircle, Heart, ArrowLeft, Newspaper, Download, Trash2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { useLikedEpisodes } from '@/hooks/use-liked-episodes';
import { showSuccess, showError } from '@/utils/toast';
import { formatDuration } from '@/lib/utils';
import { useDownloadContext } from '@/context/DownloadContext';
import { getDownloadedEpisode } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/context/SubscriptionContext';
import PremiumContentOverlay from '@/components/PremiumContentOverlay';
import { useIsMobile } from '@/hooks/use-mobile'; // Importar o hook useIsMobile
import { cn } from '@/lib/utils'; // Importar cn

const EpisodeDetail: React.FC = () => {
  const { episodeId } = useParams<{ episodeId: string }>();
  const navigate = useNavigate();
  const { playEpisode } = usePodcastPlayer();
  const { likedEpisodeIds, toggleLike, userId } = useLikedEpisodes();
  const { downloadEpisode, deleteEpisode, downloadedEpisodeIds, downloadProgress } = useDownloadContext();
  const { subscriptionStatus, isLoading: isLoadingSubscription } = useSubscription();
  const isMobile = useIsMobile(); // Usar o hook para detectar mobile

  const { data: episode, isLoading, isError, error } = useQuery({
    queryKey: ['episodeDetail', episodeId],
    queryFn: () => getEpisodeById(episodeId!),
    enabled: !!episodeId,
  });

  if (isLoading || isLoadingSubscription) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
          <span className="ml-2 text-podcast-white">Carregando detalhes do episódio...</span>
        </div>
      </Layout>
    );
  }

  if (isError || !episode) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center h-full text-red-400 bg-red-900/20 p-6 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-lg font-bold mb-2">Ocorreu um Erro</p>
          <p className="text-sm text-red-300 text-center">Não foi possível carregar os detalhes do episódio.</p>
          {error && <p className="text-xs text-red-400 mt-2 text-center font-mono bg-red-900/30 px-2 py-1 rounded">Detalhes: {error.message}</p>}
          <Button onClick={() => navigate(-1)} className="mt-4 bg-podcast-green text-podcast-black hover:opacity-90">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </Layout>
    );
  }

  const isLiked = likedEpisodeIds.has(episode.id);
  const isDownloaded = downloadedEpisodeIds.has(episode.id);
  const isDownloading = downloadProgress[episode.id] !== undefined;
  const hasPremiumSubscription = subscriptionStatus === 'premium';

  const handlePlayClick = async () => {
    if (episode.is_premium && !hasPremiumSubscription) {
      showError('Este é um episódio premium. Assine para ouvir!');
      navigate('/premium');
      return;
    }

    if (isDownloaded) {
      const storedEpisode = await getDownloadedEpisode(episode.id);
      if (storedEpisode && storedEpisode.audioBlob) {
        const localUrl = URL.createObjectURL(storedEpisode.audioBlob);
        playEpisode({ ...episode, audioUrl: localUrl });
        showSuccess(`Reproduzindo (offline): ${episode.title}`);
        return;
      }
    }

    if (episode.audioUrl) {
      playEpisode(episode);
    } else {
      showError('URL de áudio não disponível para este episódio.');
    }
  };

  const handleDownloadClick = () => {
    if (episode.is_premium && !hasPremiumSubscription) {
      showError('Este é um episódio premium. Assine para baixar!');
      navigate('/premium');
      return;
    }
    if (isDownloaded) {
      deleteEpisode(episode.id);
    } else if (!isDownloading) {
      downloadEpisode(episode);
    }
  };

  return (
    <Layout>
      <ScrollArea className="h-full">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> {/* Adicionado padding horizontal */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 text-podcast-gray hover:text-podcast-white hover:bg-podcast-black-light"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>

          <Card className="bg-podcast-black-light border-podcast-border text-podcast-white shadow-lg rounded-xl p-4 sm:p-6 mb-8"> {/* Ajustado padding */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
              <div className="relative flex-shrink-0">
                <img
                  src={episode.coverImage || '/placeholder.svg'}
                  alt={episode.title}
                  className="w-32 h-32 sm:w-48 sm:h-48 rounded-lg object-cover shadow-md" // Ajustado tamanho da imagem
                />
                {episode.is_premium && (
                  <Badge className="absolute bottom-2 left-2 bg-black/60 text-yellow-400 border-yellow-500/50 border backdrop-blur-sm">
                    <Crown className="h-4 w-4 mr-1.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <div className="text-center md:text-left flex-grow">
                <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">{episode.title}</CardTitle> {/* Ajustado tamanho do título */}
                {episode.podcastTitle && (
                  <p className="text-base sm:text-lg text-podcast-gray mb-1"> {/* Ajustado tamanho do texto */}
                    Podcast: <span className="font-medium text-podcast-white">{episode.podcastTitle}</span>
                  </p>
                )}
                {episode.host && (
                  <p className="text-sm sm:text-md text-podcast-gray mb-2"> {/* Ajustado tamanho do texto */}
                    Apresentado por: <span className="font-medium text-podcast-white">{episode.host}</span>
                  </p>
                )}
                <CardDescription className="text-xs sm:text-sm text-podcast-gray mb-4"> {/* Ajustado tamanho do texto */}
                  {new Date(episode.releaseDate).toLocaleDateString('pt-BR')} • {formatDuration(episode.duration)}
                </CardDescription>
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 sm:gap-4 mt-4"> {/* Layout flexível para botões */}
                  <Button
                    className="w-full sm:w-auto bg-podcast-green text-podcast-black hover:bg-podcast-green/90 rounded-full"
                    onClick={handlePlayClick}
                    disabled={!episode.audioUrl && !isDownloaded}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Ouvir Episódio
                  </Button>
                  {episode.audioUrl && (
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto bg-transparent border-podcast-gray text-podcast-gray hover:bg-podcast-border hover:text-podcast-white rounded-full"
                      onClick={handleDownloadClick}
                      disabled={isDownloading}
                    >
                      {isDownloading ? (
                          <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Baixando...</>
                      ) : isDownloaded ? (
                          <><Trash2 className="mr-2 h-5 w-5" /> Excluir</>
                      ) : (
                          <><Download className="mr-2 h-5 w-5" /> Download</>
                      )}
                    </Button>
                  )}
                  {userId && (
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-auto rounded-full",
                        isLiked ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "bg-transparent border-podcast-gray text-podcast-gray hover:bg-podcast-border hover:text-podcast-white"
                      )}
                      onClick={() => toggleLike(episode.id, isLiked)}
                    >
                      <Heart className={`mr-2 h-5 w-5 ${isLiked ? 'fill-white' : ''}`} />
                      {isLiked ? 'Curtido' : 'Curtir'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {episode.newsletter_content ? (
            <Card className="bg-podcast-black-light border-podcast-border text-podcast-white shadow-lg rounded-xl p-4 sm:p-6"> {/* Ajustado padding */}
              <CardHeader className="pb-4 border-b border-podcast-border mb-6">
                <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl"> {/* Ajustado tamanho do título */}
                  {episode.title}
                </CardTitle>
                {episode.newsletter_subtitle && (
                  <CardDescription className="text-base sm:text-lg text-podcast-gray mt-1"> {/* Ajustado tamanho do texto */}
                    {episode.newsletter_subtitle}
                  </CardDescription>
                )}
              </CardHeader>
              <PremiumContentOverlay
                isPremiumEpisode={!!episode.is_premium}
                hasPremiumSubscription={hasPremiumSubscription}
              >
                <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-headings:text-podcast-white prose-h1:text-3xl sm:prose-h1:text-4xl prose-h2:text-2xl sm:prose-h2:text-3xl prose-h3:text-xl sm:prose-h3:text-2xl prose-p:text-podcast-gray prose-a:text-podcast-green prose-a:no-underline hover:prose-a:underline prose-strong:text-podcast-white prose-blockquote:border-l-4 prose-blockquote:border-podcast-purple prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ul:pl-6 prose-li:marker:text-podcast-green prose-img:rounded-lg prose-hr:border-podcast-border">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {episode.newsletter_content}
                  </ReactMarkdown>
                </article>
              </PremiumContentOverlay>
            </Card>
          ) : (
            <div className="text-center py-10 bg-podcast-black-light border-podcast-border text-podcast-white rounded-xl shadow-lg px-4"> {/* Adicionado padding horizontal */}
              <Newspaper className="mx-auto h-12 w-12 mb-4 text-podcast-gray" />
              <h3 className="text-xl font-bold mb-2">Newsletter não disponível</h3>
              <p className="text-podcast-gray">
                Este episódio não possui uma newsletter associada para leitura.
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </Layout>
  );
};

export default EpisodeDetail;