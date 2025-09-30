import React, { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react';
import { Episode } from '@/types/podcast';
import PodcastPlayer from '@/components/PodcastPlayer';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './SubscriptionContext'; // Importar o hook de assinatura
import { useNavigate } from 'react-router-dom';
import { showError } from '@/utils/toast';

interface PodcastPlayerContextType {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playEpisode: (episode: Episode) => void;
  pauseEpisode: () => void;
  togglePlayPause: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
}

const PodcastPlayerContext = createContext<PodcastPlayerContextType | undefined>(undefined);

export const PodcastPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(70);
  const lastPlayed = useRef<{ episodeId: string | null, timestamp: number }>({ episodeId: null, timestamp: 0 });
  const blobUrlRef = useRef<string | null>(null);

  const { subscriptionStatus } = useSubscription(); // Usar o hook
  const navigate = useNavigate(); // Usar o hook de navegação

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  const recordPlay = useCallback(async (episodeId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    if (lastPlayed.current.episodeId === episodeId && (Date.now() - lastPlayed.current.timestamp) < 10000) {
        return;
    }
    lastPlayed.current = { episodeId, timestamp: Date.now() };

    const { error } = await supabase.functions.invoke('record-play', {
      body: { episode_id: episodeId, user_id: userId },
    });

    if (error) {
        console.error('Error recording play via Edge Function:', error);
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      if (audio.volume !== volume / 100) audio.volume = volume / 100;
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentEpisode) return;

    const audioSource = currentEpisode.audioUrl;
    if (audio.src !== audioSource) {
      audio.src = audioSource;
      audio.load();
    }

    audio.play().then(() => setIsPlaying(true)).catch(error => {
      console.error("Erro ao tentar reproduzir áudio:", error);
      setIsPlaying(false);
    });
  }, [currentEpisode]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  const pauseEpisode = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      pauseEpisode();
    } else if (currentEpisode && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        if (audioRef.current && audioRef.current.currentTime < 5 && !currentEpisode.audioUrl.startsWith('blob:')) {
            recordPlay(currentEpisode.id);
        }
      }).catch(error => {
        console.error("Erro ao tentar reproduzir áudio no toggle:", error);
        setIsPlaying(false);
      });
    }
  }, [isPlaying, currentEpisode, pauseEpisode, recordPlay]);

  const playEpisode = useCallback((episode: Episode) => {
    // Lógica de bloqueio de conteúdo premium
    if (episode.is_premium && subscriptionStatus !== 'premium') {
      showError('Este é um episódio premium. Assine para ouvir!');
      navigate('/premium');
      return;
    }

    if (currentEpisode?.id === episode.id && currentEpisode.audioUrl === episode.audioUrl) {
        togglePlayPause();
        return;
    }

    if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
    }

    if (episode.audioUrl.startsWith('blob:')) {
        blobUrlRef.current = episode.audioUrl;
    }

    setCurrentEpisode(episode);

    if (!episode.audioUrl.startsWith('blob:')) {
        recordPlay(episode.id);
    }
  }, [currentEpisode, recordPlay, togglePlayPause, subscriptionStatus, navigate]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
  }, []);

  const value = {
    currentEpisode,
    isPlaying,
    progress,
    duration,
    volume,
    playEpisode,
    pauseEpisode,
    togglePlayPause,
    seek,
    setVolume,
  };

  return (
    <PodcastPlayerContext.Provider value={value}>
      {children}
      {currentEpisode && (
        <PodcastPlayer
          currentEpisode={currentEpisode}
          isPlaying={isPlaying}
          progress={progress}
          duration={duration}
          volume={volume}
          togglePlayPause={togglePlayPause}
          seek={seek}
          setVolume={setVolume}
        />
      )}
      <audio ref={audioRef} />
    </PodcastPlayerContext.Provider>
  );
};

export const usePodcastPlayer = () => {
  const context = useContext(PodcastPlayerContext);
  if (context === undefined) {
    throw new Error('usePodcastPlayer must be used within a PodcastPlayerProvider');
  }
  return context;
};