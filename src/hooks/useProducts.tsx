import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface DbProduct {
  id: string;
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  original_price: number;
  affiliate_url: string;
  category_id: string | null;
  temperature: number;
  hot_votes: number;
  cold_votes: number;
  comments_count: number;
  store: string;
  specs: Record<string, string>;
  is_active: boolean;
  coupon_code: string | null;
  created_at: string;
  updated_at: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  } | null;
}

export interface ProductFormData {
  title: string;
  description: string;
  image_url: string;
  current_price: number;
  original_price: number;
  affiliate_url: string;
  category_id: string | null;
  store: string;
  specs: Record<string, string>;
  is_active: boolean;
  coupon_code: string | null;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbProduct[];
    },
  });
}

export function useActiveProducts() {
  return useQuery({
    queryKey: ['active-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false }); // Produtos mais recentes primeiro

      if (error) throw error;
      return data as DbProduct[];
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { user, isAdmin } = useAuth();

  return useMutation({
    mutationFn: async (product: ProductFormData) => {
      // Verificar autenticação primeiro
      if (!user) {
        throw new Error('Você precisa estar autenticado para criar produtos. Faça login e tente novamente.');
      }

      // Verificar se é admin (verificação adicional no frontend)
      if (!isAdmin) {
        throw new Error('Você não tem permissão para criar produtos. Apenas administradores podem criar produtos.');
      }

      // Verificar novamente no backend para garantir
      const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !currentUser) {
        throw new Error('Erro de autenticação. Faça login novamente e tente.');
      }

      // Tentar criar o produto
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) {
        // Mensagens de erro mais específicas
        if (error.code === '42501' || error.message.includes('permission') || error.message.includes('policy')) {
          throw new Error('Você não tem permissão para criar produtos. Verifique se você é um administrador.');
        }
        if (error.code === '23505') {
          throw new Error('Já existe um produto com essas informações. Verifique os dados e tente novamente.');
        }
        if (error.code === '23503') {
          throw new Error('Categoria inválida. Verifique se a categoria selecionada existe.');
        }
        console.error('Erro ao criar produto:', error);
        throw new Error(error.message || 'Erro ao criar produto. Verifique os dados e tente novamente.');
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast({
        title: 'Produto criado!',
        description: 'O produto foi adicionado com sucesso.',
      });
    },
    onError: (error: Error) => {
      console.error('Erro ao criar produto:', error);
      toast({
        title: 'Erro ao criar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: ProductFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast({
        title: 'Produto atualizado!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao atualizar produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast({
        title: 'Produto excluído!',
        description: 'O produto foi removido.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro ao excluir produto',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
