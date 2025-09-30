import React from 'react';
import Layout from '@/components/Layout';
import { Download, Loader2, Trash2, PlayCircle, Calendar, Clock } from 'lucide-react'; // Import Calendar and Clock for consistency
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
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile
import { cn, formatDuration } from '@/lib/utils'; // Import cn and formatDuration

const Downloads: React.FC = () => {
  const { downloadedEpisodes, isLoading, deleteEpisode } = useDownloadContext();
  const { playEpisode } = usePodcastPlayer();
  const isMobile = useIsMobile(); // Use the hook

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
      <div className="py-6 sm:py-10">
        <h1 className="text-3xl font-bold text-podcast-white mb-6 flex items-center">
          <Download className="mr-3 h-7 w-7 text-podcast-green" />
          Downloads
        </h1>
        {downloadedEpisodes.length > 0 ? (
          <div className="space-y-4">
            {downloadedEpisodes.map((episode) => (
              <div key={episode.id} className={cn(
                "flex items-center justify-between bg-podcast-black-light rounded-lg border border-podcast-border",
                isMobile ? "p-3 gap-3" : "p-4 gap-4" // Ajusta padding e gap para mobile
              )}>
                <div className="flex items-center gap-4 flex-grow min-w-0">
                  <img
                    src={episode.coverImage || '/placeholder.svg'}
                    alt={episode.title}
                    className={cn(
                      "rounded-md object-cover flex-shrink-0",
                      isMobile ? "h-12 w-12" : "h-16 w-16" // Ajusta tamanho da imagem para mobile
                    )}
                  />
                  <div className="min-w-0 flex-grow">
                    <p className="font-semibold text-podcast-white truncate">{episode.title}</p>
                    <div className="flex items-center text-sm text-podcast-gray mt-1">
                      <Calendar className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                      <span className={cn(isMobile && "text-xs")}>{new Date(episode.releaseDate).toLocaleDateString('pt-BR')}</span>
                      <span className="mx-2">•</span>
                      <Clock className={cn("mr-1", isMobile ? "h-3 w-3" : "h-4 w-4")} />
                      <span className={cn(isMobile && "text-xs")}>{formatDuration(episode.duration)}</span>
                    </div>
                  </div>
                </div>
                <div className={cn("flex items-center ml-4", isMobile ? "gap-1" : "gap-2")}> {/* Ajusta gap para botões */}
                  <Button variant="ghost" size="icon" onClick={() => handlePlayDownloaded(episode)}
                    className={cn(isMobile ? "h-8 w-8" : "h-10 w-10")}> {/* Ajusta tamanho do botão */}
                    <PlayCircle className={cn("text-podcast-green", isMobile ? "h-4 w-4" : "h-6 w-6")} /> {/* Ajusta tamanho do ícone */}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("text-red-500 hover:text-red-400", isMobile ? "h-8 w-8" : "h-10 w-10")}> {/* Ajusta tamanho do botão */}
                        <Trash2 className={cn(isMobile ? "h-4 w-4" : "h-5 w-5")} /> {/* Ajusta tamanho do ícone */}
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