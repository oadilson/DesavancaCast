import { useState, useEffect, useCallback } from 'react';
import { Episode } from '@/types/podcast';
import {
  initDB,
  addEpisodeToDB,
  getDownloadedEpisodes,
  deleteDownloadedEpisode,
  StoredEpisode,
} from '@/lib/db';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import { supabase } from '@/integrations/supabase/client';

interface DownloadProgress {
  [episodeId: string]: number; // percentage
}

export function useDownloads() {
  const [downloadedEpisodes, setDownloadedEpisodes] = useState<StoredEpisode[]>([]);
  const [downloadedEpisodeIds, setDownloadedEpisodeIds] = useState<Set<string>>(new Set());
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress>({});
  const [isLoading, setIsLoading] = useState(true);

  const refreshDownloads = useCallback(async () => {
    try {
      await initDB();
      const episodes = await getDownloadedEpisodes();
      setDownloadedEpisodes(episodes);
      setDownloadedEpisodeIds(new Set(episodes.map(ep => ep.id)));
    } catch (error) {
      console.error('Failed to refresh downloads:', error);
      showError('Não foi possível carregar os episódios baixados.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDownloads();
  }, [refreshDownloads]);

  const downloadEpisode = useCallback(async (episode: Episode) => {
    if (!episode.audioUrl) {
      showError('URL de áudio não disponível para download.');
      return;
    }
    if (downloadedEpisodeIds.has(episode.id)) {
      showSuccess('Este episódio já foi baixado.');
      return;
    }
    if (downloadProgress[episode.id] !== undefined) {
      showSuccess('Download já em progresso.');
      return;
    }

    const toastId = showLoading(`Baixando: ${episode.title}...`);
    setDownloadProgress(prev => ({ ...prev, [episode.id]: 0 }));

    try {
      const { data: blob, error } = await supabase.functions.invoke('proxy-audio', {
        body: { audioUrl: episode.audioUrl },
        responseType: 'blob'
      });

      if (error) {
        throw new Error(error.message);
      }
      if (!blob) {
        throw new Error('A resposta do servidor não continha dados de áudio.');
      }
      
      await addEpisodeToDB(episode, blob);
      
      dismissToast(toastId);
      showSuccess(`Episódio "${episode.title}" baixado com sucesso!`);
      refreshDownloads();

    } catch (error: any) {
      dismissToast(toastId);
      showError(`Falha no download: ${error.message}`);
      console.error('Download error:', error);
    } finally {
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[episode.id];
        return newProgress;
      });
    }
  }, [downloadedEpisodeIds, downloadProgress, refreshDownloads]);

  const deleteEpisode = useCallback(async (episodeId: string) => {
    const toastId = showLoading('Excluindo download...');
    try {
      await deleteDownloadedEpisode(episodeId);
      dismissToast(toastId);
      showSuccess('Download excluído com sucesso.');
      refreshDownloads();
    } catch (error: any) {
      dismissToast(toastId);
      showError(`Falha ao excluir: ${error.message}`);
    }
  }, [refreshDownloads]);

  return {
    downloadedEpisodes,
    downloadedEpisodeIds,
    downloadProgress,
    isLoading,
    downloadEpisode,
    deleteEpisode,
  };
}