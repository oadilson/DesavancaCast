import React from 'react';
import { Episode } from '@/types/podcast';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Heart, Pause, Star } from 'lucide-react'; // Importar Star
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { formatDuration } from '@/lib/utils';
import { useLikedEpisodes } from '@/hooks/use-liked-episodes';
import { useNavigate } from 'react-router-dom';
import { Badge } from './ui/badge'; // Importar Badge

interface EpisodeListProps {
  episodes: Episode[];
  podcastCoverImage?: string;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, podcastCoverImage }) => {
  const { playEpisode, currentEpisode, isPlaying } = usePodcastPlayer();
  const { likedEpisodeIds, toggleLike, userId } = useLikedEpisodes();
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {episodes.map((episode) => {
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
                <img src={episode.coverImage || podcastCoverImage || '/placeholder.svg'} alt={episode.title} className="w-full rounded-lg object-cover aspect-square" />
                {episode.is_premium && (
                  <Badge className="absolute top-2 left-2 bg-podcast-purple text-white border-none text-xs">
                    <Star className="h-3 w-3 mr-1" />
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
  );
};

export default EpisodeList;