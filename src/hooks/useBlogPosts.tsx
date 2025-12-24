import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface DbBlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author_id: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
  image_url?: string | null;
  profiles?: {
    username: string;
  } | null;
}

export interface BlogPostFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ['blog-posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          *,
          profiles (
            username
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DbBlogPost[];
    },
  });
}

export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      try {
        // Primeira tentativa: buscar posts publicados
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Erro ao buscar posts publicados:', error);
          // Se for erro de RLS ou permissão, tenta buscar sem filtro published
          if (error.code === 'PGRST301' || error.message?.includes('permission') || error.message?.includes('policy')) {
            console.warn('Tentando buscar posts sem filtro published devido a erro de permissão');
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('blog_posts')
              .select('*')
              .order('created_at', { ascending: false });
            
            if (fallbackError) {
              console.error('Erro no fallback:', fallbackError);
              throw fallbackError;
            }
            
            // Filtra manualmente posts publicados
            const publishedPosts = (fallbackData || []).filter(post => post.published === true);
            return publishedPosts.map(post => ({
              ...post,
              profiles: null,
            })) as DbBlogPost[];
          }
          throw error;
        }

        // Se não houver dados, retorna array vazio
        if (!data || data.length === 0) {
          console.log('Nenhum post publicado encontrado');
          return [] as DbBlogPost[];
        }

        // Se houver author_id, busca os profiles separadamente
        const authorIds = [...new Set(data.map(post => post.author_id).filter(Boolean))] as string[];
        
        if (authorIds.length > 0) {
          try {
            const { data: profilesData, error: profileError } = await supabase
              .from('profiles')
              .select('id, username')
              .in('id', authorIds);

            if (profileError) {
              console.warn('Erro ao buscar profiles, continuando sem eles:', profileError);
              // Retorna os posts sem profiles em caso de erro
              return data.map(post => ({
                ...post,
                profiles: null,
              })) as DbBlogPost[];
            }

            // Mapeia os profiles para os posts
            const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);
            return data.map(post => ({
              ...post,
              profiles: post.author_id ? profilesMap.get(post.author_id) || null : null,
            })) as DbBlogPost[];
          } catch (profileError) {
            console.warn('Erro ao buscar profiles, continuando sem eles:', profileError);
            // Retorna os posts sem profiles em caso de erro
            return data.map(post => ({
              ...post,
              profiles: null,
            })) as DbBlogPost[];
          }
        }

        return data.map(post => ({
          ...post,
          profiles: null,
        })) as DbBlogPost[];
      } catch (err) {
        console.error('Erro geral ao buscar posts:', err);
        // Retorna array vazio em caso de erro crítico para não quebrar a UI
        return [] as DbBlogPost[];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Erro ao buscar post:', error);
        throw error;
      }

      // Se houver author_id, busca o profile separadamente
      if (data?.author_id) {
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('id, username')
            .eq('id', data.author_id)
            .single();

          return {
            ...data,
            profiles: profileData || null,
          } as DbBlogPost;
        } catch (profileError) {
          console.warn('Erro ao buscar profile, continuando sem ele:', profileError);
          return {
            ...data,
            profiles: null,
          } as DbBlogPost;
        }
      }

      return {
        ...data,
        profiles: null,
      } as DbBlogPost;
    },
    enabled: !!slug,
    retry: 2,
    retryDelay: 1000,
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: BlogPostFormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{ ...post, author_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast({
        title: 'Post criado com sucesso!',
        description: 'O artigo foi publicado no blog.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...post }: BlogPostFormData & { id: string }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast({
        title: 'Post atualizado com sucesso!',
        description: 'As alterações foram salvas.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
      queryClient.invalidateQueries({ queryKey: ['published-blog-posts'] });
      toast({
        title: 'Post deletado com sucesso!',
        description: 'O artigo foi removido do blog.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar post',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}