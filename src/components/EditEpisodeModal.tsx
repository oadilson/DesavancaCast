import React, { useState, useEffect } from 'react';
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
import { Episode } from '@/types/podcast';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

interface EditEpisodeModalProps {
  episode: Episode | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditEpisodeModal: React.FC<EditEpisodeModalProps> = ({ episode, isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (episode) {
      setTitle(episode.title);
      setDescription(episode.description);
      setCoverImage(episode.cover_image || '');
      setNewsletterContent(episode.newsletter_content || '');
      setNewsletterSubtitle(episode.newsletter_subtitle || '');
    }
  }, [episode]);

  const handleSave = async () => {
    if (!episode) return;
    setIsSaving(true);
    const { error } = await supabase
      .from('episodes')
      .update({
        title,
        description,
        cover_image: coverImage,
        newsletter_content: newsletterContent,
        newsletter_subtitle: newsletterSubtitle,
        is_edited: true, // Marcar como editado
      })
      .eq('id', episode.id);

    setIsSaving(false);
    if (error) {
      showError('Falha ao salvar as alterações.');
      console.error(error);
    } else {
      showSuccess('Episódio atualizado com sucesso!');
      onSave();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Episódio</DialogTitle>
          <DialogDescription>
            Altere as informações deste episódio. As alterações serão salvas no banco de dados.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Título
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3 bg-podcast-border" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="newsletterSubtitle" className="text-right">
              Subtítulo
            </Label>
            <Input id="newsletterSubtitle" value={newsletterSubtitle} onChange={(e) => setNewsletterSubtitle(e.target.value)} className="col-span-3 bg-podcast-border" placeholder="Subtítulo da newsletter (opcional)" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 bg-podcast-border" rows={5} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverImage" className="text-right">
              URL da Imagem
            </Label>
            <Input id="coverImage" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="col-span-3 bg-podcast-border" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="newsletterContent" className="text-right pt-2">
              Conteúdo da Newsletter
            </Label>
            <Textarea
              id="newsletterContent"
              value={newsletterContent}
              onChange={(e) => setNewsletterContent(e.target.value)}
              className="col-span-3 bg-podcast-border"
              rows={15}
              placeholder="Cole o conteúdo da newsletter aqui (formato Markdown é recomendado)..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-podcast-green text-podcast-black hover:opacity-90">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEpisodeModal;