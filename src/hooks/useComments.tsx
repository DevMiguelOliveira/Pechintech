import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Comment } from '@/types';

export function useComments(productId?: string) {
  return useQuery({
    queryKey: ['comments', productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            id,
            username,
            avatar_url
          )
        `)
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map((c): Comment => ({
        id: c.id,
        product_id: c.product_id,
        user_id: c.user_id,
        content: c.content,
        created_at: c.created_at,
        profile: c.profiles ? {
          id: c.profiles.id,
          username: c.profiles.username,
          avatar_url: c.profiles.avatar_url,
          created_at: '',
        } : undefined,
      }));
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

      // Update comments count on product
      await supabase.rpc('increment_comments', { p_product_id: productId });

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
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

      // Update comments count on product
      await supabase.rpc('decrement_comments', { p_product_id: productId });
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
