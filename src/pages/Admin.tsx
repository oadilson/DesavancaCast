import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncAndGetPodcastForAdmin } from '@/data/podcastData'; // Usando a função de admin
import { Episode } from '@/types/podcast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, RotateCcw, BarChart2, PlayCircle, Info, Users, Clock, ListMusic, Rss, CheckCircle, Edit2 } from 'lucide-react';
import EditEpisodeModal from '@/components/EditEpisodeModal';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManageAudioTrails from '@/components/ManageAudioTrails';
import { Badge } from '@/components/ui/badge';

// Mock function to simulate fetching analytics data
const getPodcastAnalytics = async () => {
  // NOTE: This is mock data. In the future, this will call a Supabase function.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  return {
    totalPlays: 12345,
    uniqueListeners: 4892,
    averagePlayTime: "18 min 42 s",
    topEpisodes: [
      { rank: 1, title: 'O Futuro da IA', plays: 1502 },
      { rank: 2, title: 'Deep Dive em Computação Quântica', plays: 1120 },
      { rank: 3, title: 'A História da Internet', plays: 987 },
    ],
  };
};

const Admin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: myPodcast, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['myPodcastAdmin'],
    queryFn: syncAndGetPodcastForAdmin, // Usando a função de admin
  });

  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ['podcastAnalytics', myPodcast?.id],
    queryFn: getPodcastAnalytics,
    enabled: !!myPodcast,
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [isReverting, setIsReverting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (isError && error) {
      showError(`Erro ao carregar dados do podcast: ${error.message}`);
    }
  }, [isError, error]);

  const handleEditClick = (episode: Episode) => {
    setSelectedEpisode(episode);
    setIsEditModalOpen(true);
  };

  const handleSaveChanges = () => {
    queryClient.invalidateQueries({ queryKey: ['myPodcastAdmin'] });
    queryClient.invalidateQueries({ queryKey: ['myPodcastDisplay'] }); // Invalida a chave de exibição pública
    refetch();
  };

  const handlePodcastDetailsSave = () => {
    queryClient.invalidateQueries({ queryKey: ['myPodcastDisplay'] }); // Invalida a chave de exibição pública
    queryClient.invalidateQueries({ queryKey: ['myPodcastAdmin'] });
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
      console.error(error);
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
  const latestEpisode = episodes[0];
  const editedCount = episodes.filter(ep => ep.is_edited).length;

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {latestEpisode && (
                <Card className="lg:col-span-2 bg-podcast-black-light border-podcast-border text-podcast-white flex flex-col md:flex-row overflow-hidden">
                  <img src={latestEpisode.cover_image || myPodcast.coverImage} alt={latestEpisode.title} className="w-full md:w-1/3 h-48 md:h-full object-cover" />
                  <div className="p-6 flex flex-col justify-between">
                    <div>
                      <Badge variant="default" className="bg-podcast-purple mb-2">Último Episódio</Badge>
                      <h3 className="text-xl font-bold">{latestEpisode.title}</h3>
                      <p className="text-sm text-podcast-gray mt-1">
                        Publicado em {new Date(latestEpisode.release_date || '').toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Button onClick={() => handleEditClick(latestEpisode)} className="bg-podcast-green text-podcast-black hover:opacity-90">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      {latestEpisode.is_edited && (
                        <Button variant="outline" onClick={() => handleRevert(latestEpisode.id)} disabled={isReverting === latestEpisode.id}>
                          {isReverting === latestEpisode.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
              <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                <CardHeader>
                  <CardTitle>Visão Geral</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-podcast-gray">Total de Episódios</span>
                    <span className="font-bold text-2xl">{episodes.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-podcast-gray">Episódios Editados</span>
                    <span className="font-bold text-2xl">{editedCount}</span>
                  </div>
                  <Button onClick={handleSync} disabled={isSyncing} className="w-full bg-podcast-border hover:bg-podcast-border/80">
                    {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Rss className="mr-2 h-4 w-4" />}
                    Sincronizar com RSS
                  </Button>
                </CardContent>
              </Card>
            </div>

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
                                <Badge variant="secondary" className="bg-podcast-purple/20 text-podcast-purple border-none">
                                  <Edit2 className="mr-1 h-3 w-3" /> Editado
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-transparent border-podcast-gray text-podcast-gray">
                                  <CheckCircle className="mr-1 h-3 w-3" /> Original
                                </Badge>
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                  <CardHeader>
                    <CardTitle>Analytics Geral</CardTitle>
                    <CardDescription>Visão geral do desempenho.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert className="bg-podcast-purple/20 border-podcast-purple text-podcast-white mb-4">
                      <Info className="h-4 w-4 !text-podcast-white" />
                      <AlertTitle className="text-sm">Em Desenvolvimento</AlertTitle>
                      <AlertDescription className="text-xs">
                        Os dados abaixo são para demonstração.
                      </AlertDescription>
                    </Alert>
                    {isLoadingAnalytics ? (
                      <div className="flex justify-center items-center h-40">
                        <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
                      </div>
                    ) : analytics && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex justify-between items-center bg-podcast-border/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <PlayCircle className="h-5 w-5 text-podcast-gray" />
                            <span className="text-sm">Total de Reproduções</span>
                          </div>
                          <span className="font-bold text-lg">{analytics.totalPlays.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center bg-podcast-border/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-podcast-gray" />
                            <span className="text-sm">Ouvintes Únicos</span>
                          </div>
                          <span className="font-bold text-lg">{analytics.uniqueListeners.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between items-center bg-podcast-border/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-podcast-gray" />
                            <span className="text-sm">Tempo Médio</span>
                          </div>
                          <span className="font-bold text-lg">{analytics.averagePlayTime}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2"><BarChart2 className="h-5 w-5 text-podcast-green" /> Top Episódios</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-podcast-border hover:bg-transparent">
                              <TableHead>Título</TableHead>
                              <TableHead className="text-right">Plays</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analytics.topEpisodes.map((ep) => (
                              <TableRow key={ep.rank} className="border-podcast-border hover:bg-podcast-black-light/50">
                                <TableCell className="font-medium truncate max-w-[150px]">{ep.title}</TableCell>
                                <TableCell className="text-right">{ep.plays.toLocaleString('pt-BR')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
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