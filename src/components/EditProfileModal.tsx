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
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess, showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import AvatarUploader from './AvatarUploader';
import ImageCropper from './ImageCropper'; // Importar o novo componente

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

interface EditProfileModalProps {
  user: User | null;
  profile: ProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, profile, isOpen, onClose, onSave }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State for image cropper
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setAvatarUrl(profile.avatar_url || null);
    }
  }, [profile]);

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async (file: File | Blob) => {
    if (!user) return;
    try {
      setIsUploading(true);
      const fileExt = 'png'; // Cropped image is always png
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!data.publicUrl) throw new Error('Could not get public URL for avatar.');

      setAvatarUrl(data.publicUrl); // Update the avatar URL state
    } catch (error: any) {
      showError(error.message || 'Error uploading avatar.');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      showError('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }
    setIsSaving(true);

    const updateData = {
      first_name: firstName,
      last_name: lastName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    console.log('Attempting to save profile for user ID:', user.id);
    console.log('Data being sent:', updateData);

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    setIsSaving(false);
    if (error) {
      showError(`Falha ao salvar as alterações: ${error.message}`);
      console.error('Supabase update error:', error);
    } else {
      showSuccess('Perfil atualizado com sucesso!');
      onSave();
      onClose();
    }
  };

  if (!user) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-podcast-black-light border-podcast-border text-podcast-white">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Atualize suas informações pessoais. Clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <AvatarUploader user={user} currentAvatarUrl={avatarUrl} onFileSelected={handleFileSelected} />
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">
                Nome
              </Label>
              <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="col-span-3 bg-podcast-border" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lastName" className="text-right">
                Sobrenome
              </Label>
              <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="col-span-3 bg-podcast-border" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isSaving || isUploading} className="bg-podcast-green text-podcast-black hover:opacity-90">
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

export default EditProfileModal;