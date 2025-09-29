import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Loader2, User as UserIcon, Mail, Calendar, Podcast, Settings } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';
import Layout from '@/components/Layout';
import EditProfileModal from '@/components/EditProfileModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from '@tanstack/react-query';
import { getPodcastByUserId } from '@/data/podcastData';

interface ProfileData {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: userPodcast, isLoading: isLoadingPodcast } = useQuery({
    queryKey: ['userPodcast', user?.id],
    queryFn: () => getPodcastByUserId(user!.id),
    enabled: !!user, // Only run query if user exists
  });

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        showError('Não foi possível carregar os dados do perfil.');
      } else {
        setProfile(profileData);
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError('Erro ao sair: ' + error.message);
    } else {
      showSuccess('Você saiu com sucesso!');
      navigate('/');
    }
  };

  const handleProfileSave = () => {
    fetchUserData();
    // Invalidate podcast query as well in case of changes, though unlikely
    // queryClient.invalidateQueries(['userPodcast', user?.id]);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null; // Should be redirected by useEffect
  }

  const fullName = profile?.first_name || profile?.last_name ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Nome não definido';
  const avatarSeed = profile?.first_name || user.email;
  const avatarFallback = (profile?.first_name ? profile.first_name[0] : user.email?.[0] || 'U').toUpperCase();

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl py-6 sm:py-10 px-6 sm:px-8 lg:px-12">
        <Card className="bg-podcast-black-light border-podcast-border text-podcast-white shadow-lg rounded-xl">
          <CardHeader className="flex flex-col items-center space-y-4 p-6 md:flex-row md:space-y-0 md:space-x-6">
            <Avatar className="w-28 h-28 border-4 border-podcast-purple">
              <AvatarImage src={profile?.avatar_url || `https://api.dicebear.com/8.x/initials/svg?seed=${avatarSeed}`} alt="User Avatar" />
              <AvatarFallback className="text-4xl">{avatarFallback}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
              <CardTitle className="text-3xl font-bold">{fullName}</CardTitle>
              <CardDescription className="text-podcast-gray mt-1">{user.email}</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto bg-transparent border-podcast-gray hover:bg-podcast-border hover:text-podcast-white rounded-full"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar Perfil
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="destructive"
                className="w-full sm:w-auto bg-red-600/80 hover:bg-red-700 rounded-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </CardHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-podcast-black mx-auto rounded-none border-t border-b border-podcast-border">
              <TabsTrigger value="overview" className="data-[state=active]:bg-podcast-black-light data-[state=active]:text-podcast-green rounded-tl-xl">Visão Geral</TabsTrigger>
              <TabsTrigger value="podcast" className="data-[state=active]:bg-podcast-black-light data-[state=active]:text-podcast-green rounded-tr-xl">Meu Podcast</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-podcast-white">Detalhes da Conta</h3>
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 text-podcast-green mr-3" />
                    <span className="text-podcast-gray">Nome:</span>
                    <span className="ml-auto font-medium">{fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-podcast-green mr-3" />
                    <span className="text-podcast-gray">E-mail:</span>
                    <span className="ml-auto font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-podcast-green mr-3" />
                    <span className="text-podcast-gray">Membro desde:</span>
                    <span className="ml-auto font-medium">{new Date(user.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="podcast" className="p-4 sm:p-6">
              {isLoadingPodcast ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="h-8 w-8 animate-spin text-podcast-green" />
                </div>
              ) : userPodcast ? (
                <Card className="bg-podcast-border/50 border-podcast-border overflow-hidden rounded-xl">
                  <div className="flex flex-col md:flex-row">
                    <img src={userPodcast.coverImage} alt={userPodcast.title} className="w-full md:w-48 h-48 object-cover" />
                    <div className="p-4 flex flex-col">
                      <h3 className="text-xl font-bold">{userPodcast.title}</h3>
                      <p className="text-sm text-podcast-gray mt-1">por {userPodcast.host}</p>
                      <p className="text-sm text-podcast-white mt-2 flex-grow line-clamp-3">{userPodcast.description}</p>
                      <div className="mt-4 flex gap-2">
                        <Link to="/admin">
                          <Button className="bg-podcast-green text-podcast-black hover:opacity-90 rounded-full">
                            <Settings className="mr-2 h-4 w-4" />
                            Gerenciar
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center h-40 flex flex-col justify-center items-center">
                  <Podcast className="h-10 w-10 text-podcast-gray mb-2" />
                  <p className="text-podcast-white">Você ainda não gerencia um podcast.</p>
                  <p className="text-sm text-podcast-gray">Sincronize um feed RSS para começar.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      <EditProfileModal
        user={user}
        profile={profile}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleProfileSave}
      />
    </Layout>
  );
};

export default Profile;