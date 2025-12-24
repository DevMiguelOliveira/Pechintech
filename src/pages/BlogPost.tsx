import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sanitizeText, sanitizeHtml } from '@/utils/security';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, error } = useBlogPost(slug!);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
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
      
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>

      <article itemScope itemType="https://schema.org/BlogPosting">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-bold mb-4" itemProp="headline">{sanitizeText(post.title)}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <time dateTime={publishedDate} itemProp="datePublished">
                  {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </time>
              </div>
              {post.profiles?.username && (
                <div className="flex items-center gap-1" itemProp="author" itemScope itemType="https://schema.org/Person">
                  <User className="w-4 h-4" />
                  <span itemProp="name">{post.profiles.username}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {post.excerpt && (
              <p className="text-lg text-muted-foreground mb-6" itemProp="description">
                {sanitizeText(post.excerpt)}
              </p>
            )}
            <div className="prose prose-lg max-w-none dark:prose-invert" itemProp="articleBody">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </article>
    </div>
  );
};

export default BlogPost;