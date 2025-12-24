import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { trackVote } from '@/services/analytics';

export function useVotes(productId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['votes', productId],
    queryFn: async () => {
      if (!productId || !user) return null;

      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && !!user,
  });
}

export function useVote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      productId,
      voteType,
    }: {
      productId: string;
      voteType: 'hot' | 'cold';
    }) => {
      if (!user) throw new Error('Usuário não autenticado');

      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('votes')
        .select('*')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if same type
          const { error: deleteError } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id);
          
          if (deleteError) throw deleteError;

          // Use database function to decrement vote count
          const { error: decrementError } = await supabase.rpc('decrement_vote', {
            p_product_id: productId,
            p_vote_type: voteType,
          });

          if (decrementError) throw decrementError;
          
          return { action: 'removed' as const, voteType };
        } else {
          // Change vote type
          const { error: updateError } = await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id);

          if (updateError) throw updateError;

          // Use database function to change vote
          const { error: changeError } = await supabase.rpc('change_vote', {
            p_product_id: productId,
            p_old_vote_type: existingVote.vote_type,
            p_new_vote_type: voteType,
          });

          if (changeError) throw changeError;
          
          return { action: 'changed' as const, voteType };
        }
      } else {
        // New vote
        const { error: insertError } = await supabase
          .from('votes')
          .insert([{ product_id: productId, user_id: user.id, vote_type: voteType }]);

        if (insertError) throw insertError;

        // Use database function to increment vote count
        const { error: incrementError } = await supabase.rpc('increment_vote', {
          p_product_id: productId,
          p_vote_type: voteType,
        });

        if (incrementError) throw incrementError;
        
        return { action: 'added' as const, voteType };
      }
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['votes'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      
      // Analytics: tracking de voto
      if (result.action === 'added' || result.action === 'changed') {
        trackVote(variables.productId, result.voteType);
      }
      
      const messages = {
        hot: {
          added: { title: '🔥 Voto quente!', desc: 'Você esquentou essa promoção!' },
          removed: { title: 'Voto removido', desc: 'Seu voto foi removido.' },
          changed: { title: '🔥 Voto alterado!', desc: 'Agora você acha quente!' },
        },
        cold: {
          added: { title: '❄️ Voto frio!', desc: 'Você esfriou essa promoção.' },
          removed: { title: 'Voto removido', desc: 'Seu voto foi removido.' },
          changed: { title: '❄️ Voto alterado!', desc: 'Agora você acha frio!' },
        },
      };
      
      const msg = messages[result.voteType][result.action];
      toast({ title: msg.title, description: msg.desc });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao votar',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
