import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, X, GripVertical } from 'lucide-react';
import { Episode } from '@/types/podcast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

interface AudioTrail {
  id?: string;
  title: string;
  description: string;
  cover_image: string;
}

interface AudioTrailFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData?: AudioTrail & { episodes: { episode_id: string, order: number }[] };
}

const AudioTrailFormModal: React.FC<AudioTrailFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [allEpisodes, setAllEpisodes] = useState<Episode[]>([]);
  const [selectedEpisodes, setSelectedEpisodes] = useState<Episode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      setIsLoadingEpisodes(true);
      const { data, error } = await supabase
        .from('episodes')
        .select('*')
        .order('release_date', { ascending: false });
      
      if (error) {
        showError('Falha ao carregar episódios.');
        console.error(error);
      } else {
        setAllEpisodes(data as Episode[]);
      }
      setIsLoadingEpisodes(false);
    };
    fetchEpisodes();
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setCoverImage(initialData.cover_image || '');
      if (initialData.episodes && allEpisodes.length > 0) {
        const sortedEpisodeIds = initialData.episodes
          .sort((a, b) => a.order - b.order)
          .map(e => e.episode_id);
        
        const orderedEpisodes = sortedEpisodeIds
          .map(id => allEpisodes.find(ep => ep.id === id))
          .filter((ep): ep is Episode => !!ep);
        setSelectedEpisodes(orderedEpisodes);
      }
    } else {
      // Reset form for new trail
      setTitle('');
      setDescription('');
      setCoverImage('');
      setSelectedEpisodes([]);
    }
  }, [initialData, allEpisodes, isOpen]); // Rerun when modal opens

  const availableEpisodes = useMemo(() => {
    const selectedIds = new Set(selectedEpisodes.map(ep => ep.id));
    return allEpisodes.filter(ep => !selectedIds.has(ep.id));
  }, [allEpisodes, selectedEpisodes]);

  const handleSelectEpisode = (episode: Episode) => {
    setSelectedEpisodes(prev => [...prev, episode]);
  };

  const handleRemoveEpisode = (episodeId: string) => {
    setSelectedEpisodes(prev => prev.filter(ep => ep.id !== episodeId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      showError('Você precisa estar logado.');
      setIsSaving(false);
      return;
    }

    const trailData = {
      title,
      description,
      cover_image: coverImage,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    // Upsert the trail itself
    const { data: savedTrail, error: trailError } = await supabase
      .from('audio_trails')
      .upsert(initialData?.id ? { ...trailData, id: initialData.id } : trailData)
      .select()
      .single();

    if (trailError) {
      showError('Falha ao salvar a trilha.');
      console.error(trailError);
      setIsSaving(false);
      return;
    }

    // Clear existing episode associations
    const { error: deleteError } = await supabase
      .from('audio_trail_episodes')
      .delete()
      .eq('trail_id', savedTrail.id);

    if (deleteError) {
      showError('Falha ao atualizar os episódios da trilha.');
      console.error(deleteError);
      setIsSaving(false);
      return;
    }

    // Insert new episode associations with correct order
    if (selectedEpisodes.length > 0) {
      const trailEpisodes = selectedEpisodes.map((ep, index) => ({
        trail_id: savedTrail.id,
        episode_id: ep.id,
        order: index,
      }));

      const { error: insertError } = await supabase
        .from('audio_trail_episodes')
        .insert(trailEpisodes);

      if (insertError) {
        showError('Falha ao associar episódios à trilha.');
        console.error(insertError);
        setIsSaving(false);
        return;
      }
    }

    showSuccess(`Trilha "${title}" salva com sucesso!`);
    setIsSaving(false);
    onSave();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white max-w-md sm:max-w-lg md:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Editar' : 'Criar Nova'} Trilha de Áudio</DialogTitle>
          <DialogDescription>
            Defina os detalhes da trilha e adicione os episódios na ordem desejada.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
          {/* Coluna de Detalhes */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-podcast-border" />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="bg-podcast-border" rows={4} />
            </div>
            <div>
              <Label htmlFor="coverImage">URL da Imagem de Capa</Label>
              <Input id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="bg-podcast-border" />
            </div>
          </div>

          {/* Coluna de Episódios */}
          <div className="space-y-4">
            <div>
              <Label>Episódios Selecionados ({selectedEpisodes.length})</Label>
              <div className="bg-podcast-border rounded-lg p-2 min-h-[150px]">
                {selectedEpisodes.length === 0 ? (
                  <p className="text-sm text-podcast-gray text-center py-4">Nenhum episódio selecionado.</p>
                ) : (
                  <ScrollArea className="h-[150px]">
                    <div className="space-y-2 pr-2">
                      {selectedEpisodes.map((ep, index) => (
                        <div key={ep.id} className="flex items-center justify-between bg-podcast-black p-2 rounded">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-4 w-4 text-podcast-gray cursor-grab" />
                            <span className="text-sm truncate">{index + 1}. {ep.title}</span>
                          </div>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => handleRemoveEpisode(ep.id)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </div>
            <div>
              <Label>Adicionar Episódios</Label>
              <Command className="bg-podcast-border rounded-lg">
                <CommandInput placeholder="Buscar episódios..." />
                <CommandList>
                  <CommandEmpty>{isLoadingEpisodes ? 'Carregando...' : 'Nenhum episódio encontrado.'}</CommandEmpty>
                  <CommandGroup>
                    {availableEpisodes.map((ep) => (
                      <CommandItem key={ep.id} onSelect={() => handleSelectEpisode(ep)} className="cursor-pointer">
                        {ep.title}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-podcast-green text-podcast-black hover:opacity-90">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Trilha
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AudioTrailFormModal;