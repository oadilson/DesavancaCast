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
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2, Upload } from 'lucide-react';
import { Podcast } from '@/types/podcast';
import ImageCropper from './ImageCropper';

interface EditPodcastDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  initialData: Podcast | null;
}

const EditPodcastDetailsModal: React.FC<EditPodcastDetailsModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [title, setTitle] = useState('');
  const [host, setHost] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [monthlyListeners, setMonthlyListeners] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // State for image handling
  const [isUploading, setIsUploading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setHost(initialData.host || '');
      setDescription(initialData.description || '');
      setCoverImage(initialData.coverImage || '');
      setMonthlyListeners(initialData.monthly_listeners || '');
    }
  }, [initialData]);

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelected(file);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  const handleUpload = async (file: File | Blob) => {
    if (!initialData?.id) {
        showError('ID do podcast não encontrado para o upload.');
        return;
    }
    try {
      setIsUploading(true);
      const fileExt = 'png'; // Cropped image is always png
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${initialData.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('podcast-covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('podcast-covers').getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error('Não foi possível obter a URL pública da capa.');

      setCoverImage(data.publicUrl);
    } catch (error: any) {
      showError(error.message || 'Erro ao fazer upload da capa.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!initialData?.id) {
      showError('ID do podcast não disponível para salvar.');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase
      .from('podcasts')
      .update({
        title,
        host,
        description,
        cover_image: coverImage,
        monthly_listeners: monthlyListeners,
        updated_at: new Date().toISOString(),
        is_edited: true, // Marcar como editado
      })
      .eq('id', initialData.id);

    setIsSaving(false);
    if (error) {
      showError('Falha ao salvar as alterações do podcast.');
      console.error(error);
    } else {
      showSuccess('Detalhes do podcast atualizados com sucesso!');
      onSave();
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Detalhes do Podcast</DialogTitle>
            <DialogDescription>
              Atualize as informações principais do seu podcast.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Título
              </Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3 bg-podcast-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="host" className="text-right">
                Apresentador
              </Label>
              <Input id="host" value={host} onChange={(e) => setHost(e.target.value)} className="col-span-3 bg-podcast-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="monthlyListeners" className="text-right">
                Players Mensais
              </Label>
              <Input id="monthlyListeners" value={monthlyListeners} onChange={(e) => setMonthlyListeners(e.target.value)} className="col-span-3 bg-podcast-border" />
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Capa
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <img src={coverImage || '/placeholder.svg'} alt="Capa do Podcast" className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-col gap-2 w-full">
                    <Input
                        type="file"
                        id="cover-upload"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/png, image/jpeg, image/gif"
                        className="hidden"
                    />
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white">
                        <Upload className="mr-2 h-4 w-4" />
                        Alterar Imagem
                    </Button>
                    <Input 
                        id="coverImage" 
                        value={coverImage} 
                        onChange={(e) => setCoverImage(e.target.value)} 
                        className="bg-podcast-border" 
                        placeholder="Ou cole a URL da imagem"
                    />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Descrição
              </Label>
              <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3 bg-podcast-border" rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button 
              onClick={handleSave} 
              disabled={isSaving || isUploading} 
              className="bg-podcast-green text-podcast-black hover:opacity-90 disabled:bg-podcast-border disabled:text-podcast-white disabled:cursor-not-allowed"
            >
              {(isSaving || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {imageToCrop && (
        <ImageCropper
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={imageToCrop}
          onCropComplete={handleUpload}
        />
      )}
    </>
  );
};

export default EditPodcastDetailsModal;