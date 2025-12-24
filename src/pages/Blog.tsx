import { Link } from 'react-router-dom';
import { usePublishedBlogPosts } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
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
    console.error('Erro ao carregar blog:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorDetails = error instanceof Error && error.cause ? String(error.cause) : null;
    
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <SEO
          title="Blog - Erro"
          description="Erro ao carregar artigos do blog"
          url="/blog"
          noindex={true}
        />
        <h1 className="text-4xl font-bold mb-4">Erro ao carregar blog</h1>
        <p className="text-muted-foreground mb-4">
          Não foi possível carregar os artigos. Tente novamente mais tarde.
        </p>
        <div className="space-y-2 mb-6">
          <p className="text-sm text-muted-foreground/70 font-mono bg-muted p-3 rounded">
            {errorMessage}
          </p>
          {errorDetails && (
            <p className="text-xs text-muted-foreground/50">
              {errorDetails}
            </p>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Limpa o cache do React Query
              if (window.location) {
                window.location.href = '/blog';
              }
            }}
            className="mt-4"
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Blog de Tecnologia - Artigos e Novidades"
        description="Acompanhe as últimas novidades, dicas e análises sobre tecnologia, hardware, games e produtos. Artigos exclusivos sobre promoções e tendências do mercado tech."
        keywords="blog tecnologia, artigos tecnologia, novidades tech, dicas hardware, análises produtos, promoções tecnologia, tendências tech, reviews produtos"
        url="/blog"
        type="website"
        breadcrumbs={[
          { name: 'Início', url: '/' },
          { name: 'Blog', url: '/blog' },
        ]}
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': 'https://pechintech.com.br/blog',
          name: 'Blog PechinTech',
          description: 'Artigos e novidades sobre tecnologia, hardware, games e produtos',
          url: 'https://pechintech.com.br/blog',
          publisher: {
            '@type': 'Organization',
            name: 'PechinTech',
            url: 'https://pechintech.com.br',
          },
          blogPost: posts?.map((post) => ({
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.excerpt || post.title,
            url: `https://pechintech.com.br/blog/${post.slug}`,
            datePublished: post.created_at,
            author: post.profiles?.username ? {
              '@type': 'Person',
              name: post.profiles.username,
            } : undefined,
          })) || [],
        }}
      />
      
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