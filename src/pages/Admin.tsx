import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncAndGetPodcastForAdmin, getPodcastAnalytics } from '@/data/podcastData';
import { Episode } from '@/types/podcast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, RotateCcw, BarChart2, PlayCircle, Info, Users, Clock, ListMusic, Rss, CheckCircle, Edit2, Globe, Star } from 'lucide-react';
import EditEpisodeModal from '@/components/EditEpisodeModal';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageAudioTrails from '@/components/ManageAudioTrails';
import { Badge } from '@/components/ui/badge';
import CountryPlaysMap from '@/components/CountryPlaysMap';
import { Switch } from '@/components/ui/switch';

const Admin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: myPodcast, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myPodcastAdmin'],
    queryFn: syncAndGetPodcastForAdmin,
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['podcastAnalytics', myPodcast?.id],
    queryFn: () => getPodcastAnalytics(myPodcast!.id),
    enabled: !!myPodcast?.id,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isReverting, setIsReverting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [updatingPremium, setUpdatingPremium] = useState<string | null>(null);

  useEffect(() => {
    if (isError && error) {
      showError(`Erro ao carregar dados do podcast: ${error.message}`);
    }
  }, [isError, error]);

  const invalidateAllEpisodeQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['myPodcastAdmin'] });
    queryClient.invalidateQueries({ queryKey: ['myPodcastDisplay'] });
    queryClient.invalidateQueries({ queryKey: ['allEpisodesDisplay'] });
    queryClient.invalidateQueries({ queryKey: ['latestReleasesDisplay'] });
    queryClient.invalidateQueries({ queryKey: ['popularEpisodes'] });
    queryClient.invalidateQueries({ queryKey: ['likedEpisodes'] });
    queryClient.invalidateQueries({ queryKey: ['episodeDetail'] });
    queryClient.invalidateQueries({ queryKey: ['audioTrailsHome'] });
  };

  const handleEditClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = () => {
    invalidateAllEpisodeQueries();
    refetch();
  };

  const handleRevert = async (episodeId: string) => {
    setIsReverting(episodeId);
    const { error } = await supabase.functions.invoke('revert-episode-to-rss', {
      body: { episode_id: episodeId },
    });
    setIsReverting(null);

    if (error) {
      showError('Falha ao reverter o episódio.');
    } else {
      showSuccess('Episódio revertido para a versão original do RSS!');
      handleSaveChanges();
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    showSuccess('Sincronização iniciada... Isso pode levar um momento.');
    await refetch();
    setIsSyncing(false);
  };

  const handlePremiumToggle = async (episodeId: string, isPremium: boolean) => {
    setUpdatingPremium(episodeId);
    const { error } = await supabase
      .from('episodes')
      .update({ 
        is_premium: isPremium,
        is_edited: true // Marcar como editado para proteger da sincronização
      })
      .eq('id', episodeId);
    
    if (error) {
      showError('Falha ao atualizar o status premium.');
    } else {
      showSuccess(`Episódio ${isPremium ? 'marcado como' : 'removido de'} premium.`);
      invalidateAllEpisodeQueries();
    }
    setUpdatingPremium(null);
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

  if (isError || !myPodcast) {
    return (
      <Layout>
        <div className="text-red-500">
          Erro ao carregar dados do podcast: {error?.message}
        </div>
      </Layout>
    );
  }

  const episodes = myPodcast.episodes.sort((a, b) => new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime());

  return (
    <Layout>
      <div className="container mx-auto max-w-screen-xl py-6 sm:py-10 px-6 sm:px-8 lg:px-12">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-podcast-white">Painel do Administrador</h1>
          <p className="text-podcast-gray">Gerencie seu conteúdo e analise seu desempenho em um só lugar.</p>
        </div>

        <Tabs defaultValue="episodes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 bg-podcast-black-light border-podcast-border mb-6">
            <TabsTrigger value="episodes">Gerenciar Episódios</TabsTrigger>
            <TabsTrigger value="trails">Gerenciar Trilhas de Áudio</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="episodes" className="space-y-6">
            {/* ... (código do card de visão geral) ... */}

            <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
              <CardHeader>
                <CardTitle>Todos os Episódios</CardTitle>
                <CardDescription>
                  Veja e gerencie todos os episódios do seu podcast.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-podcast-border hover:bg-transparent">
                          <TableHead className="w-[80px]"></TableHead>
                          <TableHead>Título</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Premium</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {episodes.map((episode) => (
                          <TableRow key={episode.id} className="border-podcast-border hover:bg-podcast-border/50">
                            <TableCell>
                              <img src={episode.cover_image || myPodcast.coverImage} alt={episode.title} className="h-12 w-12 rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{episode.title}</TableCell>
                            <TableCell className="text-podcast-gray">{new Date(episode.release_date || '').toLocaleDateString('pt-BR')}</TableCell>
                            <TableCell>
                              {episode.is_edited ? (
                                <Badge variant="secondary" className="bg-podcast-green/20 text-podcast-green border-none">
                                  <Edit2 className="mr-1 h-3 w-3" /> Editado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-transparent border-podcast-gray text-podcast-gray">
                                  <CheckCircle className="mr-1 h-3 w-3" /> Original
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {updatingPremium === episode.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Switch
                                  checked={episode.is_premium}
                                  onCheckedChange={(checked) => handlePremiumToggle(episode.id, checked)}
                                  aria-label="Marcar como premium"
                                  className="data-[state=checked]:bg-podcast-green"
                                />
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleEditClick(episode)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              {episode.is_edited && (
                                <Button variant="ghost" size="icon" onClick={() => handleRevert(episode.id)} disabled={isReverting === episode.id}>
                                  {isReverting === episode.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trails">
            <ManageAudioTrails />
          </TabsContent>

          <TabsContent value="analytics">
            {/* ... (código de analytics) ... */}
          </TabsContent>
        </Tabs>
      </div>
      <EditEpisodeModal
        episode={selectedEpisode}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveChanges}
      />
    </Layout>
  );
};

export default Admin;