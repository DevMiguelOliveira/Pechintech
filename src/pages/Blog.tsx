import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublishedBlogPosts } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Blog = () => {
  const { data: posts, isLoading, error } = usePublishedBlogPosts();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-4">Blog</h1>
          <p className="text-muted-foreground text-center">
            Artigos e novidades sobre tecnologia
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Erro ao carregar blog</h1>
        <p className="text-muted-foreground">
          Não foi possível carregar os artigos. Tente novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4">Blog</h1>
        <p className="text-muted-foreground text-center">
          Artigos e novidades sobre tecnologia
        </p>
      </div>

      {posts && posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Nenhum artigo publicado ainda.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">
                  <Link
                    to={`/blog/${post.slug}`}
                    className="hover:text-primary transition-colors"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  {post.profiles?.username && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.profiles.username}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {post.excerpt && (
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                )}
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-primary hover:underline font-medium"
                >
                  Ler mais →
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;