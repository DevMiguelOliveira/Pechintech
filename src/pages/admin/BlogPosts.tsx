import { useState } from 'react';
import { useBlogPosts, useCreateBlogPost, useUpdateBlogPost, useDeleteBlogPost, BlogPostFormData } from '@/hooks/useBlogPosts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { GeradorIA } from '@/components/GeradorIA';
import { AutoPublishBlog } from '@/components/admin/AutoPublishBlog';
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from 'react-hook-form';
import { toast } from '@/hooks/use-toast';

const BlogPosts = () => {
  const { data: posts, isLoading } = useBlogPosts();
  const createPost = useCreateBlogPost();
  const updatePost = useUpdateBlogPost();
  const deletePost = useDeleteBlogPost();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<BlogPostFormData>();
  const watchedContent = watch('content');
  const watchedPublished = watch('published');
  const watchedTitle = watch('title');

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleCreate = (data: BlogPostFormData) => {
    createPost.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        reset();
      },
    });
  };

  const handleUpdate = (data: BlogPostFormData) => {
    if (editingPost) {
      updatePost.mutate({ ...data, id: editingPost.id }, {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setEditingPost(null);
          reset();
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    deletePost.mutate(id);
  };

  const openEditDialog = (post: any) => {
    setEditingPost(post);
    setValue('title', post.title);
    setValue('slug', post.slug);
    setValue('content', post.content);
    setValue('excerpt', post.excerpt || '');
    setValue('published', post.published);
    setValue('image_url', post.image_url || '');
    setIsEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingPost(null);
    reset();
  };

  const closeCreateDialog = () => {
    setIsCreateDialogOpen(false);
    reset();
  };


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Gerenciar Blog</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciar Blog</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Post</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreate)} className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  {...register('title', { required: 'Título é obrigatório' })}
                  onChange={(e) => {
                    register('title').onChange(e);
                    setValue('slug', generateSlug(e.target.value));
                  }}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  {...register('slug', { required: 'Slug é obrigatório' })}
                />
                {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
              </div>

              <div>
                <Label htmlFor="excerpt">Resumo (opcional)</Label>
                <Textarea
                  id="excerpt"
                  {...register('excerpt')}
                  placeholder="Breve descrição do post..."
                />
              </div>

              <div>
                <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                <Input
                  id="image_url"
                  type="url"
                  {...register('image_url')}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL da imagem de capa do post. Se não informado, será usada a imagem padrão.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Conteúdo (Markdown)</Label>
                </div>
                
                {/* Gerador de IA */}
                <div className="mb-4">
                  <GeradorIA
                    initialTema={watchedTitle || ''}
                    onContentGenerated={(content) => {
                      setValue('content', content);
                      
                      // Gerar excerpt automaticamente se não estiver preenchido
                      const currentExcerpt = watch('excerpt');
                      if (!currentExcerpt || currentExcerpt.trim().length === 0) {
                        // Extrair primeiro parágrafo ou primeiras 200 caracteres
                        const plainText = content
                          .replace(/^#+\s+/gm, '')
                          .replace(/\*\*/g, '')
                          .replace(/\*/g, '')
                          .trim();
                        const firstParagraph = plainText.split('\n\n')[0] || plainText.substring(0, 200);
                        const excerpt = firstParagraph.length > 200 
                          ? firstParagraph.substring(0, 197) + '...' 
                          : firstParagraph;
                        setValue('excerpt', excerpt);
                      }
                      
                      toast({
                        title: 'Conteúdo gerado!',
                        description: 'O conteúdo e resumo foram preenchidos automaticamente. Revise antes de salvar.',
                      });
                    }}
                  />
                </div>

                <Textarea
                  {...register('content', { required: 'Conteúdo é obrigatório' })}
                  placeholder="Escreva o conteúdo do post em Markdown ou use o gerador de IA acima..."
                  rows={10}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Escreva o conteúdo do post em formato Markdown ou use o gerador de IA acima.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={watchedPublished}
                  onCheckedChange={(checked) => setValue('published', checked)}
                />
                <Label htmlFor="published">Publicado</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeCreateDialog}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPost.isPending}>
                  {createPost.isPending ? 'Criando...' : 'Criar Post'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Auto Publish Component */}
      <AutoPublishBlog />

      <div className="grid gap-4">
        {posts?.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{post.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={post.published ? 'default' : 'secondary'}>
                      {post.published ? <Eye className="w-3 h-3 mr-1" /> : <EyeOff className="w-3 h-3 mr-1" />}
                      {post.published ? 'Publicado' : 'Rascunho'}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(post.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                    {post.profiles?.username && (
                      <span className="text-sm text-muted-foreground">
                        por {post.profiles.username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(post)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o post "{post.title}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(post.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {post.excerpt && (
                <p className="text-muted-foreground mb-4">{post.excerpt}</p>
              )}
              <div className="text-sm text-muted-foreground">
                Slug: {post.slug}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdate)} className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                {...register('title', { required: 'Título é obrigatório' })}
                onChange={(e) => {
                  register('title').onChange(e);
                  setValue('slug', generateSlug(e.target.value));
                }}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                {...register('slug', { required: 'Slug é obrigatório' })}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div>
              <Label htmlFor="edit-excerpt">Resumo (opcional)</Label>
              <Textarea
                id="edit-excerpt"
                {...register('excerpt')}
                placeholder="Breve descrição do post..."
              />
            </div>

            <div>
              <Label htmlFor="edit-image_url">URL da Imagem (opcional)</Label>
              <Input
                id="edit-image_url"
                type="url"
                {...register('image_url')}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-muted-foreground mt-1">
                URL da imagem de capa do post. Se não informado, será usada a imagem padrão.
              </p>
            </div>

            <div>
              <Label>Conteúdo (Markdown)</Label>
              <Textarea
                {...register('content', { required: 'Conteúdo é obrigatório' })}
                placeholder="Escreva o conteúdo do post em Markdown..."
                rows={10}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="edit-published"
                checked={watchedPublished}
                onCheckedChange={(checked) => setValue('published', checked)}
              />
              <Label htmlFor="edit-published">Publicado</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeEditDialog}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePost.isPending}>
                {updatePost.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BlogPosts;