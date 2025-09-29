import React from 'react';
import { AudioTrail } from '@/types/podcast';
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';

interface AudioTrailsProps {
  trails: AudioTrail[];
}

const AudioTrails: React.FC<AudioTrailsProps> = ({ trails }) => {
  const { playEpisode } = usePodcastPlayer();

  if (!trails || trails.length === 0) {
    return null;
  }

  const handlePlayTrail = (trail: AudioTrail) => {
    if (trail.episodes && trail.episodes.length > 0) {
      playEpisode(trail.episodes[0]);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-podcast-white">Trilhas de Áudio Exclusivas</h2>
      <div className="relative">
        <ScrollArea className="w-full whitespace-nowrap rounded-xl">
          <div className="flex w-max space-x-4 pb-4">
            {trails.map((trail) => (
              <Card key={trail.id} className="bg-podcast-black-light border-none text-podcast-white hover:bg-podcast-border transition-colors group p-3 w-48 sm:w-60 shrink-0 rounded-xl shadow-lg">
                <CardContent className="p-0">
                  <div className="relative mb-3">
                    <img src={trail.cover_image || '/placeholder.svg'} alt={trail.title} className="h-36 w-full sm:h-48 rounded-lg object-cover" />
                    <Button
                      size="icon"
                      className="absolute bottom-2 right-2 rounded-full bg-podcast-green text-podcast-black h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-y-0 translate-y-2 hover:bg-podcast-green/90"
                      onClick={(e) => { 
                        e.stopPropagation();
                        handlePlayTrail(trail);
                      }}
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                  <CardTitle className="text-md font-semibold truncate whitespace-normal">{trail.title}</CardTitle>
                  <CardDescription className="text-sm text-podcast-gray mt-1 line-clamp-2 whitespace-normal">{trail.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default AudioTrails;