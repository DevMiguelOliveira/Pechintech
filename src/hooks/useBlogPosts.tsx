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
      // Busca posts sem join para evitar problemas de RLS
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (!data || data.length === 0) {
        return [] as DbBlogPost[];
      }

      // Busca profiles separadamente
      const authorIds = [...new Set(data.map(post => post.author_id).filter(Boolean))] as string[];
      
      if (authorIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', authorIds);

          if (profilesData && profilesData.length > 0) {
            const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
            return data.map((post: any) => ({
              ...post,
              profiles: post.author_id ? profilesMap.get(post.author_id) || null : null,
            })) as DbBlogPost[];
          }
        } catch (profileError) {
          console.warn('Erro ao buscar profiles:', profileError);
        }
      }

      return data.map((post: any) => ({
        ...post,
        profiles: null,
      })) as DbBlogPost[];
    },
  });
}

export function usePublishedBlogPosts() {
  return useQuery({
    queryKey: ['published-blog-posts'],
    queryFn: async () => {
      try {
        console.log('Iniciando busca de posts publicados...');
        
        // Estratégia 1: Buscar posts publicados diretamente
        let { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false });

        // Se houver erro, tenta estratégias alternativas
        if (error) {
          console.warn('Erro na busca inicial:', error);
          
          // Estratégia 2: Buscar todos e filtrar no cliente
          const { data: allData, error: allError } = await supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false });

          if (allError) {
            console.error('Erro ao buscar todos os posts:', allError);
            // Estratégia 3: Retornar array vazio se tudo falhar
            console.warn('Retornando array vazio devido a erros de permissão');
            return [] as DbBlogPost[];
          }

          // Filtra posts publicados no cliente
          data = (allData || []).filter((post: any) => post.published === true) as any[];
          console.log(`Encontrados ${data.length} posts publicados (filtrado no cliente)`);
        } else {
          console.log(`Encontrados ${data?.length || 0} posts publicados`);
        }

        // Se não houver dados, retorna array vazio
        if (!data || data.length === 0) {
          console.log('Nenhum post publicado encontrado');
          return [] as DbBlogPost[];
        }

        // Garante que data seja um array válido
        const postsData = Array.isArray(data) ? data : [];

        // Busca profiles separadamente (opcional, não crítico)
        const authorIds = [...new Set(postsData.map((post: any) => post.author_id).filter(Boolean))] as string[];
        
        if (authorIds.length > 0) {
          try {
            const { data: profilesData } = await supabase
              .from('profiles')
              .select('id, username')
              .in('id', authorIds);

            if (profilesData && profilesData.length > 0) {
              const profilesMap = new Map(profilesData.map((p: any) => [p.id, p]));
              return postsData.map((post: any) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                content: post.content,
                excerpt: post.excerpt,
                author_id: post.author_id,
                published: post.published,
                created_at: post.created_at,
                updated_at: post.updated_at,
                image_url: post.image_url || null,
                profiles: post.author_id ? profilesMap.get(post.author_id) || null : null,
              })) as DbBlogPost[];
            }
          } catch (profileError) {
            console.warn('Erro ao buscar profiles (não crítico):', profileError);
          }
        }

        // Retorna posts sem profiles se não conseguir buscar
        return postsData.map((post: any) => ({
          id: post.id,
          title: post.title,
          slug: post.slug,
          content: post.content,
          excerpt: post.excerpt,
          author_id: post.author_id,
          published: post.published,
          created_at: post.created_at,
          updated_at: post.updated_at,
          image_url: post.image_url || null,
          profiles: null,
        })) as DbBlogPost[];
      } catch (err) {
        console.error('Erro crítico ao buscar posts:', err);
        // Retorna array vazio para não quebrar a UI
        return [] as DbBlogPost[];
      }
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    retry: 2,
    retryDelay: 1000,
    // Não retry em caso de erro de permissão
    retryOnMount: true,
    refetchOnWindowFocus: false,
  });
}

export function useBlogPost(slug: string) {
  return useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) {
        throw new Error('Slug é obrigatório');
      }

      console.log(`Buscando post com slug: ${slug}`);
      
      // Estratégia 1: Buscar com filtro published
      let { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      // Se houver erro, tenta buscar sem filtro published e filtra no cliente
      if (error) {
        console.warn('Erro na busca inicial, tentando sem filtro published:', error);
        const { data: allData, error: allError } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .single();

        if (allError) {
          console.error('Erro ao buscar post:', allError);
          throw allError;
        }

        // Verifica se o post está publicado
        if (!allData || allData.published !== true) {
          throw new Error('Post não encontrado ou não publicado');
        }

        data = allData;
      }

      if (!data) {
        throw new Error('Post não encontrado');
      }

      // Busca profile separadamente (opcional)
      if (data.author_id) {
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
          console.warn('Erro ao buscar profile (não crítico):', profileError);
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
    refetchOnWindowFocus: false,
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