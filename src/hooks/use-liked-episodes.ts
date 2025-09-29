import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchLikedEpisodeIds, addLikedEpisode, removeLikedEpisode } from '@/data/podcastData';
import { showSuccess, showError } from '@/utils/toast';
import { useEffect, useState } from 'react';

export function useLikedEpisodes() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const { data: likedEpisodeIds = [], isLoading: isLoadingLiked } = useQuery({
    queryKey: ['likedEpisodeIds', userId],
    queryFn: () => fetchLikedEpisodeIds(userId!),
    enabled: !!userId, // Only run if userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const likedEpisodeIdsSet = new Set(likedEpisodeIds);

  const addLikeMutation = useMutation({
    mutationFn: ({ episodeId, userId }: { episodeId: string; userId: string }) =>
      addLikedEpisode(episodeId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedEpisodeIds', userId] });
      queryClient.invalidateQueries({ queryKey: ['likedEpisodes', userId] }); // Invalidate for the LikedEpisodes page
      showSuccess('Episódio curtido!');
    },
    onError: (error) => {
      showError('Falha ao curtir o episódio.');
      console.error('Error liking episode:', error);
    },
  });

  const removeLikeMutation = useMutation({
    mutationFn: ({ episodeId, userId }: { episodeId: string; userId: string }) =>
      removeLikedEpisode(episodeId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedEpisodeIds', userId] });
      queryClient.invalidateQueries({ queryKey: ['likedEpisodes', userId] }); // Invalidate for the LikedEpisodes page
      showSuccess('Curtida removida.');
    },
    onError: (error) => {
      showError('Falha ao remover a curtida.');
      console.error('Error unliking episode:', error);
    },
  });

  const toggleLike = (episodeId: string, isCurrentlyLiked: boolean) => {
    if (!userId) {
      showError('Você precisa estar logado para curtir episódios.');
      return;
    }

    if (isCurrentlyLiked) {
      removeLikeMutation.mutate({ episodeId, userId });
    } else {
      addLikeMutation.mutate({ episodeId, userId });
    }
  };

  return {
    likedEpisodeIds: likedEpisodeIdsSet,
    isLoadingLiked,
    toggleLike,
    userId,
  };
}