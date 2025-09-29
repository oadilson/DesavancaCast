import React from 'react'
import { User } from '@supabase/supabase-js'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Upload } from 'lucide-react'

interface AvatarUploaderProps {
  user: User
  currentAvatarUrl: string | null
  onFileSelected: (file: File) => void
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ user, currentAvatarUrl, onFileSelected }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onFileSelected(file)
    }
    // Reset the input value to allow selecting the same file again
    if (event.target) {
      event.target.value = "";
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  const displayUrl = currentAvatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${user.email}`
  const avatarFallback = (user.email?.[0] || 'U').toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="w-32 h-32 border-4 border-podcast-purple">
        <AvatarImage src={displayUrl} alt="User Avatar" />
        <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
      </Avatar>
      <Input
        type="file"
        id="avatar-upload"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/gif"
        className="hidden"
      />
      <Button onClick={triggerFileInput} variant="outline" className="bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white">
        <Upload className="mr-2 h-4 w-4" />
        Alterar Foto
      </Button>
    </div>
  )
}

export default AvatarUploader