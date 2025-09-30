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
        isMobile ? "p-2 gap-2" : "p-4 gap-4" // Adjusted padding and gap for mobile to be slightly smaller
      )}
      onClick={() => navigate(`/episode/${episode.id}`)}
    >
      <div className="flex items-center gap-3 flex-grow min-w-0"> {/* Adjusted gap here */}
        <div className="relative flex-shrink-0">
          <img
            src={episode.coverImage || podcastCoverImage || '/placeholder.svg'}
            alt={episode.title}
            className={cn(
              "rounded-md object-cover",
              isMobile ? "h-10 w-10" : "h-16 w-16" // Adjusted image size for mobile
            )}
          />
          {episode.is_premium && (
            <Badge className="absolute -top-1 -right-1 bg-black/60 text-yellow-400 border-yellow-500/50 border text-xs backdrop-blur-sm px-1.5 py-0.5"> {/* Adjusted badge position/padding */}
              <Crown className="h-2.5 w-2.5" /> {/* Adjusted badge icon size */}
            </Badge>
          )}
        </div>
        <div className={cn("min-w-0 flex-grow", isMobile && "flex flex-col")}> {/* Added flex-col for mobile text stacking */}
          <h3 className="font-semibold text-podcast-white truncate">{episode.title}</h3>
          <div className="flex items-center text-sm text-podcast-gray mt-1">
            <Calendar className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span className={cn(isMobile && "text-xs")}>{new Date(episode.releaseDate).toLocaleDateString('pt-BR')}</span>
            <span className="mx-2">•</span>
            <Clock className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
            <span className={cn(isMobile && "text-xs")}>{formatDuration(episode.duration)}</span>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        className={cn(
          "rounded-full bg-podcast-green text-podcast-black flex-shrink-0 ml-4 hover:bg-podcast-green/90",
          isMobile ? "h-9 w-9" : "h-10 w-10" // Adjusted button size for mobile
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