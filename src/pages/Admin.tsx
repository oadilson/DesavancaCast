import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { syncAndGetPodcastForAdmin, getPodcastAnalytics } from '@/data/podcastData';
import { Episode } from '@/types/podcast';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Edit, RotateCcw, BarChart2, PlayCircle, Info, Users, Clock, ListMusic, Rss, CheckCircle, Edit2, Globe, Star, FileText, Calendar, Activity, Crown, Settings, Music4 } from 'lucide-react';
import EditEpisodeModal from '@/components/EditEpisodeModal';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent } from "@/components/ui/tabs"; // Removido TabsList e TabsTrigger
import ManageAudioTrails from '@/components/ManageAudioTrails';
import { Badge } from '@/components/ui/badge';
import CountryPlaysMap from '@/components/CountryPlaysMap';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils'; // Importar cn para classes condicionais

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
  const [activeSection, setActiveSection] = useState<'episodes' | 'trails' | 'analytics'>('episodes'); // Novo estado para a seção ativa

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
    queryClient.invalidateQueries({ queryKey: ['podcastAnalytics'] }); // Invalida analytics também
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
      <div className=""> {/* Removido max-w-screen-xl mx-auto */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-podcast-white">Painel do Administrador</h1>
          <p className="text-podcast-gray">Gerencie seu conteúdo e analise seu desempenho em um só lugar.</p>
        </div>

        {/* Botões de navegação personalizados */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Button
            onClick={() => setActiveSection('episodes')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-colors",
              activeSection === 'episodes'
                ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90 shadow-md"
                : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white border border-podcast-border"
            )}
          >
            <ListMusic className="h-5 w-5" /> Gerenciar Episódios
          </Button>
          <Button
            onClick={() => setActiveSection('trails')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-colors",
              activeSection === 'trails'
                ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90 shadow-md"
                : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white border border-podcast-border"
            )}
          >
            <Music4 className="h-5 w-5" /> Gerenciar Trilhas
          </Button>
          <Button
            onClick={() => setActiveSection('analytics')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-base font-semibold transition-colors",
              activeSection === 'analytics'
                ? "bg-podcast-green text-podcast-black hover:bg-podcast-green/90 shadow-md"
                : "bg-podcast-black-light text-podcast-gray hover:bg-podcast-border hover:text-podcast-white border border-podcast-border"
            )}
          >
            <BarChart2 className="h-5 w-5" /> Analytics
          </Button>
        </div>

        {/* Conteúdo condicionalmente renderizado */}
        {activeSection === 'episodes' && (
          <div className="space-y-6">
            <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Visão Geral do Podcast</CardTitle>
                  <CardDescription>
                    Informações gerais e sincronização do seu podcast.
                  </CardDescription>
                </div>
                <Button onClick={handleSync} disabled={isSyncing} className="bg-podcast-green text-podcast-black hover:bg-podcast-green/90">
                  {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RotateCcw className="mr-2 h-4 w-4" />}
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar RSS'}
                </Button>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center space-x-4">
                  <img src={myPodcast.coverImage || '/placeholder.svg'} alt={myPodcast.title} className="h-24 w-24 rounded-lg object-cover" />
                  <div>
                    <h3 className="text-xl font-bold">{myPodcast.title}</h3>
                    <p className="text-podcast-gray">{myPodcast.host}</p>
                    <p className="text-sm text-podcast-gray">{myPodcast.episodes.length} episódios</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-podcast-gray">
                    <Rss className="mr-2 h-4 w-4 text-podcast-green" />
                    <span className="font-medium text-podcast-white truncate">{myPodcast.rss_feed_url}</span>
                  </div>
                  <div className="flex items-center text-sm text-podcast-gray">
                    <Info className="mr-2 h-4 w-4 text-podcast-green" />
                    <span className="font-medium text-podcast-white">
                      {myPodcast.is_edited ? 'Detalhes editados manualmente' : 'Detalhes do RSS original'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4" /> Título
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" /> Data
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4" /> Status
                            </div>
                          </TableHead>
                          <TableHead>
                            <div className="flex items-center gap-2">
                              <Crown className="h-4 w-4" /> Premium
                            </div>
                          </TableHead>
                          <TableHead className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Settings className="h-4 w-4" /> Ações
                            </div>
                          </TableHead>
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
                                <Badge className="bg-podcast-green text-podcast-black border-transparent hover:bg-podcast-green/90">
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
          </div>
        )}

        {activeSection === 'trails' && (
          <div>
            <ManageAudioTrails />
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-podcast-white mb-4">Visão Geral de Analytics</h2>
            {isLoadingAnalytics ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
                <span className="ml-2 text-podcast-white">Carregando analytics...</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total de Reproduções</CardTitle>
                      <PlayCircle className="h-4 w-4 text-podcast-green" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.totalPlays || 0}</div>
                      <p className="text-xs text-podcast-gray">Total de vezes que um episódio foi reproduzido.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Ouvintes Únicos</CardTitle>
                      <Users className="h-4 w-4 text-podcast-green" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.uniqueListeners || 0}</div>
                      <p className="text-xs text-podcast-gray">Número de usuários distintos que reproduziram.</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Tempo Médio de Reprodução</CardTitle>
                      <Clock className="h-4 w-4 text-podcast-green" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{analytics?.averagePlayTime || "Em breve"}</div>
                      <p className="text-xs text-podcast-gray">Média de tempo que os usuários ouvem.</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                  <CardHeader>
                    <CardTitle>Episódios Mais Populares</CardTitle>
                    <CardDescription>Os episódios mais reproduzidos do seu podcast.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.topEpisodes && analytics.topEpisodes.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-podcast-border hover:bg-transparent">
                            <TableHead className="w-[50px]">Rank</TableHead>
                            <TableHead>Título do Episódio</TableHead>
                            <TableHead className="text-right">Reproduções</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {analytics.topEpisodes.map((episode) => (
                            <TableRow key={episode.rank} className="border-podcast-border hover:bg-podcast-border/50">
                              <TableCell className="font-medium">{episode.rank}</TableCell>
                              <TableCell>{episode.title}</TableCell>
                              <TableCell className="text-right">{episode.plays}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-4 text-podcast-gray">Nenhum episódio popular ainda.</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
                  <CardHeader>
                    <CardTitle>Reproduções por País</CardTitle>
                    <CardDescription>Distribuição geográfica das reproduções do seu podcast.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics?.playsByCountry && analytics.playsByCountry.length > 0 ? (
                      <CountryPlaysMap playsByCountry={analytics.playsByCountry} />
                    ) : (
                      <div className="text-center py-4 text-podcast-gray">Nenhum dado de reprodução por país ainda.</div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
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