import { Link } from 'react-router-dom';
import { usePublishedBlogPosts } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { Calendar, User, Home, Sparkles, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { testSupabaseConnection } from '@/utils/testSupabaseConnection';
import { cn } from '@/lib/utils';

const Blog = () => {
  const { data: posts, isLoading, error, refetch } = usePublishedBlogPosts();
  const [connectionTest, setConnectionTest] = useState<any>(null);

  // Testa conexão quando há erro
  useEffect(() => {
    if (error) {
      testSupabaseConnection().then(setConnectionTest).catch(console.error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        {/* Background Tech Pattern */}
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
          <div className="mb-8 sm:mb-12">
            <div className="flex items-center justify-center mb-4">
              <Skeleton className="h-12 w-32 sm:h-14 sm:w-40" />
            </div>
            <Skeleton className="h-5 w-64 mx-auto" />
          </div>
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Erro ao carregar blog:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorDetails = error instanceof Error && (error as any).cause ? String((error as any).cause) : null;
    
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
          {connectionTest && (
            <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
              <p className="text-sm font-semibold">Diagnóstico de Conexão:</p>
              <ul className="text-xs space-y-1 font-mono">
                <li>Cliente configurado: {connectionTest.clientConfigured ? '✅' : '❌'}</li>
                <li>URL: {connectionTest.url}</li>
                <li>Chave anon: {connectionTest.anonKey}</li>
                <li>Pode conectar: {connectionTest.canConnect ? '✅' : '❌'}</li>
                <li>Pode ler posts: {connectionTest.canReadBlogPosts ? '✅' : '❌'}</li>
                <li>Total de posts: {connectionTest.blogPostsCount}</li>
                <li>Posts publicados: {connectionTest.publishedPostsCount}</li>
                {connectionTest.errors.length > 0 && (
                  <li className="text-red-500">
                    Erros: {connectionTest.errors.join(', ')}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => {
              refetch();
            }}
            className="mt-4"
          >
            Tentar Novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4"
          >
            Recarregar Página
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95 relative overflow-hidden">
      {/* Background Tech Pattern */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none z-0">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Animated Gradient Orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
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
        
        {/* Header Section */}
        <div className="mb-8 sm:mb-12 lg:mb-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Button 
              variant="outline" 
              asChild
              className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 shrink-0"
            >
              <Link to="/" className="flex items-center">
                <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="hidden sm:inline">Home</span>
                <span className="sm:hidden">Início</span>
              </Link>
            </Button>
            
            <div className="flex-1 text-center w-full sm:w-auto">
              <div className="inline-flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary animate-pulse shrink-0" />
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
                  Blog Tech
                </h1>
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary animate-pulse shrink-0" style={{ animationDelay: '0.3s' }} />
              </div>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                Artigos e novidades sobre tecnologia
              </p>
            </div>
            
            <div className="hidden sm:block w-16 lg:w-24 shrink-0"></div> {/* Spacer para centralizar */}
          </div>
        </div>

        {!posts || posts.length === 0 ? (
          <div className="text-center py-12 sm:py-16 lg:py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted/50 mb-6">
              <Sparkles className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg sm:text-xl mb-4">
              Nenhum artigo publicado ainda.
            </p>
            {error && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg max-w-2xl mx-auto border border-border/50">
                <p className="text-sm text-muted-foreground font-mono">
                  {error instanceof Error ? error.message : 'Erro desconhecido'}
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground/70 mt-4">
              Os artigos aparecerão aqui quando forem publicados.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts?.map((post, index) => (
              <Card 
                key={post.id} 
                className={cn(
                  "group relative overflow-hidden h-full flex flex-col",
                  "border-2 border-border/50 bg-card/50 backdrop-blur-sm",
                  "hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10",
                  "transition-all duration-500 ease-out",
                  "hover:-translate-y-2 hover:scale-[1.02]",
                  "animate-in fade-in slide-in-from-bottom-4",
                  "cursor-pointer"
                )}
                style={{
                  animationDelay: `${Math.min(index * 100, 1000)}ms`,
                  animationFillMode: 'both',
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Animated Border Glow */}
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />

                <Link to={`/blog/${post.slug}`} className="flex-1 flex flex-col">
                  <CardHeader className="relative z-10 flex-1">
                    <CardTitle className="line-clamp-2 text-lg sm:text-xl lg:text-2xl mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300 font-bold">
                      {post.title}
                    </CardTitle>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                        <time>{format(new Date(post.created_at), 'dd/MM/yyyy', { locale: ptBR })}</time>
                      </div>
                      {post.profiles?.username && (
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                          <span className="truncate max-w-[120px] sm:max-w-none">{post.profiles.username}</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 mt-auto">
                    {post.excerpt && (
                      <p className="text-muted-foreground line-clamp-3 mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all duration-300">
                      <span className="text-sm sm:text-base">Ler mais</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;