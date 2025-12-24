import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Comment } from '@/types';
import { trackComment } from '@/services/analytics';

interface DbComment {
  id: string;
  product_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface DbProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

export function useComments(productId?: string) {
  return useQuery({
    queryKey: ['comments', productId],
    queryFn: async () => {
      if (!productId) return [];

      // First get comments
      const { data: commentsData, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (commentsError) throw commentsError;
      if (!commentsData || commentsData.length === 0) return [];

      // Get unique user IDs
      const userIds = [...new Set(commentsData.map((c) => c.user_id))];

      // Fetch profiles for those users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Create a map of profiles
      const profilesMap = new Map<string, DbProfile>();
      profilesData?.forEach((p) => {
        profilesMap.set(p.id, p);
      });

      // Map comments with profiles
      return commentsData.map((c): Comment => {
        const profile = profilesMap.get(c.user_id);
        return {
          id: c.id,
          product_id: c.product_id,
          user_id: c.user_id,
          content: c.content,
          created_at: c.created_at,
          profile: profile ? {
            id: profile.id,
            username: profile.username,
            avatar_url: profile.avatar_url,
            created_at: '',
          } : undefined,
        };
      });
    },
    enabled: !!productId,
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      content,
    }: {
      productId: string;
      content: string;
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('comments')
        .insert([{ product_id: productId, user_id: user.id, content }])
        .select()
        .single();

      if (error) throw error;

      // Use database function to increment comments count
      const { error: incrementError } = await supabase.rpc('increment_comments', {
        p_product_id: productId,
      });

      if (incrementError) throw incrementError;

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      
      // Analytics: tracking de comentário
      trackComment(variables.productId);
      
      toast({
        title: 'Comentário adicionado!',
        description: 'Seu comentário foi publicado.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao comentar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, productId }: { commentId: string; productId: string }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      // Use database function to decrement comments count
      const { error: decrementError } = await supabase.rpc('decrement_comments', {
        p_product_id: productId,
      });

      if (decrementError) throw decrementError;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast({
        title: 'Comentário removido',
        description: 'Seu comentário foi excluído.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
