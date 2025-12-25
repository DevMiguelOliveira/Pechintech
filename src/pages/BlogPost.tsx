import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { ArrowLeft, Calendar, User, Home, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeText, sanitizeHtml } from '@/utils/security';
import { cn } from '@/lib/utils';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug!);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-4xl">
          <div className="mb-6">
            <Skeleton className="h-10 w-32 sm:w-40" />
          </div>
          <Card className="border-2 border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-8 w-3/4 mb-4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-4">Post não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O artigo que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>
    );
  }

  const publishedDate = new Date(post.created_at).toISOString();
  const modifiedDate = post.updated_at ? new Date(post.updated_at).toISOString() : publishedDate;
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://pechintech.com.br';
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const postImage = post.image_url || `${siteUrl}/web-app-manifest-512x512.png`;

  // Extrair palavras-chave do título e conteúdo
  const keywords = [
    'tecnologia',
    'hardware',
    'promoções',
    'ofertas',
    ...(post.title.toLowerCase().split(' ').filter(w => w.length > 3)),
  ].slice(0, 10).join(', ');

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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 max-w-4xl relative z-10">
        <SEO
          title={post.title}
          description={post.excerpt || `${post.title} - Artigo completo sobre tecnologia e promoções no PechinTech`}
          keywords={keywords}
          image={postImage}
          url={`/blog/${post.slug}`}
          type="article"
          publishedTime={publishedDate}
          modifiedTime={modifiedDate}
          author={post.profiles?.username}
          section="Tecnologia"
          tags={keywords.split(', ')}
          breadcrumbs={[
            { name: 'Início', url: '/' },
            { name: 'Blog', url: '/blog' },
            { name: post.title, url: `/blog/${post.slug}` },
          ]}
          structuredData={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            '@id': postUrl,
            headline: post.title,
            description: post.excerpt || post.title,
            image: postImage,
            datePublished: publishedDate,
            dateModified: modifiedDate,
            author: {
              '@type': 'Person',
              name: post.profiles?.username || 'PechinTech',
            },
            publisher: {
              '@type': 'Organization',
              name: 'PechinTech',
              url: siteUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/web-app-manifest-512x512.png`,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': postUrl,
            },
            articleSection: 'Tecnologia',
            keywords: keywords,
          }}
        />
        
        {/* Navigation Buttons */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-2 sm:gap-3">
          <Button 
            variant="ghost" 
            asChild
            className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Link to="/blog" className="flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Voltar ao Blog</span>
              <span className="sm:hidden">Voltar</span>
            </Link>
          </Button>
          <Button 
            variant="outline" 
            asChild
            className="border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
          >
            <Link to="/" className="flex items-center">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>

        {/* Article Card */}
        <article itemScope itemType="https://schema.org/BlogPosting">
          <Card className={cn(
            "relative overflow-hidden",
            "border-2 border-border/50 bg-card/50 backdrop-blur-sm",
            "shadow-2xl shadow-primary/5"
          )}>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            
            <CardHeader className="relative z-10 pb-4 sm:pb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
                <h1 
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight" 
                  itemProp="headline"
                >
                  {sanitizeText(post.title)}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground pt-2 border-t border-border/50">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={publishedDate} itemProp="datePublished">
                    {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </time>
                </div>
                {post.profiles?.username && (
                  <div className="flex items-center gap-1.5" itemProp="author" itemScope itemType="https://schema.org/Person">
                    <User className="w-4 h-4" />
                    <span itemProp="name">{post.profiles.username}</span>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="relative z-10 pt-6 sm:pt-8">
              {post.excerpt && (
                <div className="mb-6 sm:mb-8 p-4 sm:p-6 rounded-lg bg-muted/30 border border-border/50 backdrop-blur-sm">
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed" itemProp="description">
                    {sanitizeText(post.excerpt)}
                  </p>
                </div>
              )}
              
              <div 
                className={cn(
                  "prose prose-lg sm:prose-xl max-w-none dark:prose-invert",
                  "prose-headings:font-bold prose-headings:text-foreground",
                  "prose-p:text-foreground/90 prose-p:leading-relaxed",
                  "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                  "prose-strong:text-foreground prose-strong:font-semibold",
                  "prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
                  "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
                  "prose-blockquote:border-l-primary prose-blockquote:bg-muted/30",
                  "prose-img:rounded-lg prose-img:shadow-lg",
                  "prose-ul:list-disc prose-ol:list-decimal",
                  "prose-li:marker:text-primary"
                )} 
                itemProp="articleBody"
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </article>
      </div>
    </div>
  );
};

export default BlogPost;