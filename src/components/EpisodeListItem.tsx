import React from 'react';
import { Episode } from '@/types/podcast';
import { Button } from '@/components/ui/button';
import { Play, Pause, Calendar, Clock, Crown } from 'lucide-react';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { formatDuration } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge';

interface EpisodeListItemProps {
  episode: Episode;
  podcastCoverImage?: string;
}

const EpisodeListItem: React.FC<EpisodeListItemProps> = ({ episode, podcastCoverImage }) => {
  const { playEpisode, currentEpisode, isPlaying } = usePodcastPlayer();
  const navigate = useNavigate();

  const isCurrentEpisodePlaying = isPlaying && currentEpisode?.id === episode.id;

  return (
    <div
      className="flex items-center justify-between p-4 bg-podcast-black-light rounded-lg border border-podcast-border hover:bg-podcast-border transition-colors cursor-pointer"
      onClick={() => navigate(`/episode/${episode.id}`)}
    >
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div className="relative flex-shrink-0">
          <img
            src={episode.coverImage || podcastCoverImage || '/placeholder.svg'}
            alt={episode.title}
            className="h-16 w-16 rounded-md object-cover"
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
            <Calendar className="h-4 w-4 mr-1" />
            <span>{new Date(episode.releaseDate).toLocaleDateString('pt-BR')}</span>
            <span className="mx-2">•</span>
            <Clock className="h-4 w-4 mr-1" />
            <span>{formatDuration(episode.duration)}</span>
          </div>
        </div>
      </div>
      <Button
        size="icon"
        className="rounded-full bg-podcast-green text-podcast-black h-10 w-10 flex-shrink-0 ml-4 hover:bg-podcast-green/90"
        onClick={(e) => {
          e.stopPropagation();
          playEpisode(episode);
        }}
      >
        {isCurrentEpisodePlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-1" />}
      </Button>
    </div>
  );
};

export default EpisodeListItem;