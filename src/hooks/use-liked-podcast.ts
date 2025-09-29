import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { fetchLikedPodcastIds, addLikedPodcast, removeLikedPodcast } from '@/data/podcastData';
import { showSuccess, showError } from '@/utils/toast';
import { useEffect, useState } from 'react';

export function useLikedPodcast(podcastId: string | undefined) {
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

  const { data: likedPodcastIds = [], isLoading: isLoadingLiked } = useQuery({
    queryKey: ['likedPodcastIds', userId],
    queryFn: () => fetchLikedPodcastIds(userId!),
    enabled: !!userId, // Only run if userId is available
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const isPodcastLiked = podcastId ? likedPodcastIds.includes(podcastId) : false;

  const addLikeMutation = useMutation({
    mutationFn: ({ podcastId, userId }: { podcastId: string; userId: string }) =>
      addLikedPodcast(podcastId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedPodcastIds', userId] });
      showSuccess('Podcast curtido!');
    },
    onError: (error) => {
      showError('Falha ao curtir o podcast.');
      console.error('Error liking podcast:', error);
    },
  });

  const removeLikeMutation = useMutation({
    mutationFn: ({ podcastId, userId }: { podcastId: string; userId: string }) =>
      removeLikedPodcast(podcastId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likedPodcastIds', userId] });
      showSuccess('Curtida removida do podcast.');
    },
    onError: (error) => {
      showError('Falha ao remover a curtida do podcast.');
      console.error('Error unliking podcast:', error);
    },
  });

  const toggleLikePodcast = () => {
    if (!userId) {
      showError('Você precisa estar logado para curtir podcasts.');
      return;
    }
    if (!podcastId) {
      showError('ID do podcast não disponível.');
      return;
    }

    if (isPodcastLiked) {
      removeLikeMutation.mutate({ podcastId, userId });
    } else {
      addLikeMutation.mutate({ podcastId, userId });
    }
  };

  return {
    isPodcastLiked,
    isLoadingLiked,
    toggleLikePodcast,
    userId,
  };
}