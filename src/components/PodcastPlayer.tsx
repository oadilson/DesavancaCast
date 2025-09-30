import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Maximize, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import MarqueeText from './MarqueeText'; // Importar o novo componente

interface PodcastPlayerProps {
  className?: string;
  currentEpisode: any;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

const PodcastPlayer: React.FC<PodcastPlayerProps> = ({
  currentEpisode,
  isPlaying,
  progress,
  duration,
  volume,
  togglePlayPause,
  seek,
  setVolume,
}) => {
  const isMobile = useIsMobile();

  if (!currentEpisode) {
    return null;
  }

  // Ajusta a posição 'bottom' para mobile para ficar acima da MobileBottomNav
  const mobileBottomPosition = isMobile ? '80px' : '0'; // 64px (MobileBottomNav) + 16px (padding/gap) = 80px

  if (isMobile) {
    return (
      <div className="fixed left-0 right-0 bg-podcast-black-light text-podcast-white p-2 border-t border-podcast-border flex flex-col z-50" style={{ bottom: mobileBottomPosition }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1 min-w-0">
            <img src={currentEpisode.coverImage || '/placeholder.svg'} alt={currentEpisode.title} className="h-10 w-10 rounded-md mr-2 object-cover" />
            <div className="flex-1 overflow-hidden"> {/* Adicionado flex-1 e overflow-hidden */}
              <MarqueeText text={currentEpisode.title} className="text-sm font-medium" />
              {currentEpisode.newsletter_subtitle && (
                <MarqueeText text={currentEpisode.newsletter_subtitle} className="text-xs text-podcast-gray mt-0.5" />
              )}
              <p className="text-xs text-podcast-gray truncate">{currentEpisode.host}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10"
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-podcast-black-light border-podcast-border text-podcast-white">
                <div className="p-4">
                  <DrawerHeader>
                    <DrawerTitle className="text-center">{currentEpisode.title}</DrawerTitle>
                    {currentEpisode.newsletter_subtitle && (
                      <p className="text-sm text-podcast-gray text-center mt-1">{currentEpisode.newsletter_subtitle}</p>
                    )}
                  </DrawerHeader>
                  <div className="flex items-center justify-center space-x-4 my-4">
                    <Button variant="ghost" size="icon"><SkipBack className="h-6 w-6" /></Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-full bg-podcast-green text-podcast-black" onClick={togglePlayPause}>
                      {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                    </Button>
                    <Button variant="ghost" size="icon"><SkipForward className="h-6 w-6" /></Button>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Volume2 className="h-4 w-4 text-podcast-gray" />
                    <Slider
                      value={[volume]}
                      max={100}
                      step={1}
                      onValueChange={(val) => setVolume(val[0])}
                      className="w-full [&>span:first-child]:bg-podcast-green [&>span:first-child>span]:bg-podcast-green"
                    />
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
        <div className="flex items-center w-full space-x-2 mt-1">
          <span className="text-xs text-podcast-gray">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={(val) => seek(val[0])}
            className="w-full [&>span:first-child]:bg-podcast-green [&>span:first-child>span]:bg-podcast-green"
          />
          <span className="text-xs text-podcast-gray">{formatTime(duration)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-podcast-black-light text-podcast-white p-4 border-t border-podcast-border flex items-center justify-between z-50 rounded-t-xl shadow-lg">
      {/* Episode Info */}
      <div className="flex items-center w-1/4">
        <img src={currentEpisode.coverImage || '/placeholder.svg'} alt={currentEpisode.title} className="h-12 w-12 rounded-md mr-3 object-cover" />
        <div className="flex-grow overflow-hidden"> {/* Adicionado flex-grow e overflow-hidden */}
          <MarqueeText text={currentEpisode.title} className="text-sm font-medium" />
          {currentEpisode.newsletter_subtitle && (
            <MarqueeText text={currentEpisode.newsletter_subtitle} className="text-xs text-podcast-gray mt-0.5" />
          )}
          <p className="text-xs text-podcast-gray">{currentEpisode.host}</p>
        </div>
      </div>

      {/* Controls and Progress */}
      <div className="flex flex-col items-center w-1/2">
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" size="icon" className="text-podcast-gray hover:text-podcast-white">
            <SkipBack className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full bg-podcast-green text-podcast-black hover:bg-podcast-green/90 h-10 w-10"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="text-podcast-gray hover:text-podcast-white">
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center w-full max-w-xl space-x-2">
          <span className="text-xs text-podcast-gray">{formatTime(progress)}</span>
          <Slider
            value={[progress]}
            max={duration}
            step={1}
            onValueChange={(val) => seek(val[0])}
            className="w-full [&>span:first-child]:bg-podcast-green [&>span:first-child>span]:bg-podcast-green"
          />
          <span className="text-xs text-podcast-gray">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume and More Controls */}
      <div className="flex items-center justify-end w-1/4 space-x-2">
        <Volume2 className="h-4 w-4 text-podcast-gray" />
        <Slider
          value={[volume]}
          max={100}
          step={1}
          onValueChange={(val) => setVolume(val[0])}
          className="w-24 [&>span:first-child]:bg-podcast-green [&>span:first-child>span]:bg-podcast-green"
        />
        <Button variant="ghost" size="icon" className="text-podcast-gray hover:text-podcast-white">
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PodcastPlayer;