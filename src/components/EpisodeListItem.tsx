import React from 'react';
import { Episode } from '@/types/podcast';
import { Button } from '@/components/ui/button';
import { Play, Pause, Calendar, Clock, Crown } from 'lucide-react';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { formatDuration } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils'; // Import cn

interface EpisodeListItemProps {
  episode: Episode;
  podcastCoverImage?: string;
  isMobile?: boolean; // Nova propriedade
}

const EpisodeListItem: React.FC<EpisodeListItemProps> = ({ episode, podcastCoverImage, isMobile = false }) => {
  const { playEpisode, currentEpisode, isPlaying } = usePodcastPlayer();
  const navigate = useNavigate();

  const isCurrentEpisodePlaying = isPlaying && currentEpisode?.id === episode.id;

  return (
    <div
      className={cn(
        "flex items-center justify-between bg-podcast-black-light rounded-lg border border-podcast-border hover:bg-podcast-border transition-colors cursor-pointer",
        isMobile ? "p-3 gap-3" : "p-4 gap-4" // Ajusta padding e gap para mobile
      )}
      onClick={() => navigate(`/episode/${episode.id}`)}
    >
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={episode.coverImage || podcastCoverImage || '/placeholder.svg'}
            alt={episode.title}
            className={cn(
              "rounded-md object-cover",
              isMobile ? "h-12 w-12" : "h-16 w-16" // Ajusta tamanho da imagem para mobile
            )}
          />
          {episode.is_premium && (
            <Badge className="absolute -top-2 -right-2 bg-black/60 text-yellow-400 border-yellow-500/50 border text-xs backdrop-blur-sm px-2 py-0.5">
              <Crown className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <div className="min-w-0 flex-grow">
          <h3 className="font-semibold text-podcast-white truncate">{episode.title}</h3>
          <div className="flex items-center text-sm text-podcast-gray mt-1">
            <Calendar className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} /> {/* Ajusta tamanho do ícone */}
            <span className={cn(isMobile && "text-xs")}>{new Date(episode.releaseDate).toLocaleDateString('pt-BR')}</span>
            <span className="mx-2">•</span>
            <Clock className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} /> {/* Ajusta tamanho do ícone */}
            <span className={cn(isMobile && "text-xs")}>{formatDuration(episode.duration)}</span>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        className={cn(
          "rounded-full bg-podcast-green text-podcast-black flex-shrink-0 ml-4 hover:bg-podcast-green/90",
          isMobile ? "h-8 w-8" : "h-10 w-10" // Ajusta tamanho do botão para mobile
        )}
        onClick={(e) => {
          e.stopPropagation();
          playEpisode(episode);
        }}
      >
        {isCurrentEpisodePlaying ? <Pause className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} /> : <Play className={cn("ml-1", isMobile ? "h-4 w-4" : "h-5 w-5")} />}
      </Button>
    </div>
  );
};

export default EpisodeListItem;