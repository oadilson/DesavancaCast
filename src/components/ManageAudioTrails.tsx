import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, PlusCircle, Edit, Trash2, Music4 } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import AudioTrailFormModal from './AudioTrailFormModal';
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

const fetchAudioTrails = async () => {
  const { data, error } = await supabase
    .from('audio_trails')
    .select('*, episodes:audio_trail_episodes(episode_id, order)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
};

const ManageAudioTrails: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: trails, isLoading, isError } = useQuery({
    queryKey: ['audioTrails'],
    queryFn: fetchAudioTrails,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrail, setSelectedTrail] = useState<any>(null);

  const handleAddNew = () => {
    setSelectedTrail(null);
    setIsModalOpen(true);
  };

  const handleEdit = (trail: any) => {
    setSelectedTrail(trail);
    setIsModalOpen(true);
  };

  const handleDelete = async (trailId: string) => {
    const { error } = await supabase.from('audio_trails').delete().eq('id', trailId);
    if (error) {
      showError('Falha ao excluir a trilha.');
      console.error(error);
    } else {
      showSuccess('Trilha excluída com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['audioTrails'] });
    }
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ['audioTrails'] });
  };

  return (
    <>
      <Card className="bg-podcast-black-light border-podcast-border text-podcast-white">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Gerenciar Trilhas de Áudio</CardTitle>
            <CardDescription>Crie e edite suas playlists premium.</CardDescription>
          </div>
          <Button onClick={handleAddNew} className="bg-podcast-green text-podcast-black hover:bg-podcast-green/90">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Trilha
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
            </div>
          ) : isError ? (
            <p className="text-red-500">Erro ao carregar as trilhas.</p>
          ) : trails && trails.length > 0 ? (
            <div className="space-y-4">
              {trails.map((trail) => (
                <div key={trail.id} className="flex items-center justify-between p-4 bg-podcast-border/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={trail.cover_image || '/placeholder.svg'} alt={trail.title} className="h-12 w-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold">{trail.title}</p>
                      <p className="text-sm text-podcast-gray">{trail.episodes.length} episódio(s)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(trail)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente a trilha "{trail.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(trail.id)} className="bg-red-600 hover:bg-red-700">
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
            <div className="text-center py-10">
              <Music4 className="mx-auto h-12 w-12 text-podcast-gray" />
              <h3 className="mt-2 text-sm font-semibold text-podcast-white">Nenhuma trilha de áudio encontrada</h3>
              <p className="mt-1 text-sm text-podcast-gray">Comece criando sua primeira trilha.</p>
            </div>
          )}
        </CardContent>
      </Card>
      <AudioTrailFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedTrail}
      />
    </>
  );
};

export default ManageAudioTrails;