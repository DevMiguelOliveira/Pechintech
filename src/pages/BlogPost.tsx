import { useParams, Link } from 'react-router-dom';
import { useBlogPost } from '@/hooks/useBlogPosts';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MDEditor from '@uiw/react-md-editor';

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link to="/blog">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Blog
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {format(new Date(post.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
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
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <MDEditor.Markdown source={post.content} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost;