import React from 'react';
import Layout from '@/components/Layout';
import { Download, Loader2, Trash2, PlayCircle } from 'lucide-react';
import { useDownloadContext } from '@/context/DownloadContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePodcastPlayer } from '@/context/PodcastPlayerContext';
import { Episode } from '@/types/podcast';

const Downloads: React.FC = () => {
  const { downloadedEpisodes, isLoading, deleteEpisode } = useDownloadContext();
  const { playEpisode } = usePodcastPlayer();

  const handlePlayDownloaded = (episode: Episode) => {
    const storedEpisode = downloadedEpisodes.find(e => e.id === episode.id);
    if (storedEpisode && storedEpisode.audioBlob) {
      const localUrl = URL.createObjectURL(storedEpisode.audioBlob);
      playEpisode({ ...episode, audioUrl: localUrl });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-6 sm:py-10"> {/* Removido max-w-screen-xl mx-auto */}
        <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
          <Download className="mr-3 h-7 w-7 text-podcast-green" />
          Downloads
        </h1>
        {downloadedEpisodes.length > 0 ? (
          <div className="space-y-4">
            {downloadedEpisodes.map((episode) => (
              <div key={episode.id} className="flex items-center justify-between p-4 bg-podcast-black-light rounded-lg border border-podcast-border">
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <img src={episode.coverImage || '/placeholder.svg'} alt={episode.title} className="h-16 w-16 rounded-md object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-podcast-white truncate">{episode.title}</p>
                    <p className="text-sm text-podcast-gray truncate">{episode.host || 'Podcast'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button variant="ghost" size="icon" onClick={() => handlePlayDownloaded(episode)}>
                    <PlayCircle className="h-6 w-6 text-podcast-green" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Download?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Isso removerá "{episode.title}" dos seus downloads. A ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white">Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteEpisode(episode.id)} className="bg-red-600 hover:bg-red-700">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 text-podcast-white bg-podcast-black-light p-6 rounded-lg">
            <Download className="h-12 w-12 mb-4 text-podcast-gray" />
            <p className="text-lg font-bold mb-2">Nenhum episódio baixado</p>
            <p className="text-sm text-podcast-gray text-center">
              Baixe episódios para ouvi-los offline.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Downloads;