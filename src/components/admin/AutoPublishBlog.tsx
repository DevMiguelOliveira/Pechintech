/**
 * Componente para publicação automática de posts de blog
 * 
 * Gera posts automáticos sobre:
 * - Produtos existentes no site
 * - Novidades de tecnologia, hardware e games
 * 
 * Inclui links de produtos relacionados automaticamente
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, AlertCircle, CheckCircle2, Zap, Package, TrendingUp } from 'lucide-react';
import { useActiveProducts } from '@/hooks/useProducts';
import { useCreateBlogPost } from '@/hooks/useBlogPosts';
import { gerarPostAutomatico, encontrarProdutosRelacionados, extrairPalavrasChave, gerarTemasNovidades, type ProdutoRelacionado, type GerarPostAutomaticoResponse } from '@/services/autoBlog';
import { converterEstruturadoParaMarkdown, gerarExcerptEstruturado } from '@/utils/contentConverter';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function AutoPublishBlog() {
  const { data: produtos, isLoading: isLoadingProdutos } = useActiveProducts();
  const createPost = useCreateBlogPost();

  const [tipoPost, setTipoPost] = useState<'produto' | 'novidade'>('produto');
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>('');
  const [temaNovidade, setTemaNovidade] = useState<string>('');
  const [temaCustomizado, setTemaCustomizado] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [produtosRelacionados, setProdutosRelacionados] = useState<ProdutoRelacionado[]>([]);
  const [conteudoGerado, setConteudoGerado] = useState<string>('');
  const [conteudoEstruturado, setConteudoEstruturado] = useState<GerarPostAutomaticoResponse | null>(null);

  const temasNovidades = gerarTemasNovidades();

  const produtoAtual = produtos?.find(p => p.id === produtoSelecionado);

  /**
   * Gera conteúdo do post
   */
  const handleGerar = async () => {
    setError(null);
    setSuccess(null);
    setConteudoGerado('');
    setProdutosRelacionados([]);
    setIsGenerating(true);

    try {
      let request;

      if (tipoPost === 'produto') {
        if (!produtoSelecionado || !produtoAtual) {
          setError('Selecione um produto para gerar o post.');
          setIsGenerating(false);
          return;
        }

        // Encontrar produtos relacionados
        const palavrasChave = extrairPalavrasChave(
          `${produtoAtual.title} ${produtoAtual.description} ${produtoAtual.categories?.name || ''}`
        );
        const relacionados = encontrarProdutosRelacionados(
          produtos || [],
          palavrasChave,
          3
        );
        setProdutosRelacionados(relacionados);

        request = {
          tipo: 'produto' as const,
          produtoId: produtoSelecionado,
          tema: produtoAtual.title,
          descricaoProduto: {
            title: produtoAtual.title,
            description: produtoAtual.description,
            current_price: produtoAtual.current_price,
            category: produtoAtual.categories?.name || 'Tecnologia',
            specs: produtoAtual.specs,
            affiliate_url: produtoAtual.affiliate_url,
          },
          produtosRelacionados: relacionados,
        };
      } else {
        // Tipo: novidade
        const tema = temaCustomizado.trim() || temaNovidade;
        if (!tema || tema.length < 10) {
          setError('Informe um tema para a novidade (mínimo 10 caracteres).');
          setIsGenerating(false);
          return;
        }

        // Encontrar produtos relacionados baseado no tema
        const palavrasChave = extrairPalavrasChave(tema);
        const relacionados = encontrarProdutosRelacionados(
          produtos || [],
          palavrasChave,
          5
        );
        setProdutosRelacionados(relacionados);

        request = {
          tipo: 'novidade' as const,
          tema: tema,
          produtosRelacionados: relacionados,
        };
      }

      // Gerar conteúdo com IA
      const response = await gerarPostAutomatico(request);

      if (response.error) {
        setError(response.error);
        return;
      }

      // Verificar formato da resposta (estruturado ou markdown)
      if (response.format === 'structured') {
        // Formato novo: JSON estruturado
        if (!response.title || !response.structuredContent) {
          setError('Resposta estruturada inválida.');
          return;
        }

        // Converter para Markdown
        const markdown = converterEstruturadoParaMarkdown({
          title: response.title,
          slug: response.slug || '',
          metaDescription: response.metaDescription || '',
          coverImage: response.coverImage || { source: 'sugestao', reference: '' },
          content: response.structuredContent,
          tags: response.tags || [],
        });

        setConteudoEstruturado(response);
        setConteudoGerado(markdown);
        setSuccess('Conteúdo estruturado gerado com sucesso! Revise e publique quando estiver pronto.');
      } else {
        // Formato antigo: markdown direto
        if (!response.content) {
          setError('Nenhum conteúdo foi gerado.');
          return;
        }

        setConteudoEstruturado(null);
        setConteudoGerado(response.content);
        setSuccess('Conteúdo gerado com sucesso! Revise e publique quando estiver pronto.');
      }

    } catch (err) {
      console.error('[AutoPublishBlog] Erro ao gerar conteúdo:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Erro desconhecido ao gerar conteúdo.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Publica o post gerado
   */
  const handlePublicar = async () => {
    if (!conteudoGerado) {
      setError('Gere o conteúdo primeiro antes de publicar.');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      let titulo: string;
      let slug: string;
      let excerpt: string;
      let imageUrl: string | null = null;

      // Usar dados estruturados se disponível
      if (conteudoEstruturado && conteudoEstruturado.format === 'structured') {
        titulo = conteudoEstruturado.title || '';
        slug = conteudoEstruturado.slug || generateSlug(titulo);
        excerpt = gerarExcerptEstruturado({
          title: titulo,
          slug: slug,
          metaDescription: conteudoEstruturado.metaDescription || '',
          coverImage: conteudoEstruturado.coverImage || { source: 'sugestao', reference: '' },
          content: conteudoEstruturado.structuredContent || [],
          tags: conteudoEstruturado.tags || [],
        });

        // Usar imagem do coverImage se for do site
        if (conteudoEstruturado.coverImage?.source === 'site' && conteudoEstruturado.coverImage?.reference) {
          imageUrl = conteudoEstruturado.coverImage.reference;
        } else if (tipoPost === 'produto' && produtoAtual?.image_url) {
          imageUrl = produtoAtual.image_url;
        }
      } else {
        // Fallback para formato antigo (markdown)
        titulo = tipoPost === 'produto' && produtoAtual
          ? `Guia Completo: ${produtoAtual.title} - Análise e Onde Comprar`
          : temaCustomizado.trim() || temaNovidade;

        slug = generateSlug(titulo);

        // Gerar excerpt do conteúdo markdown
        const plainText = conteudoGerado
          .replace(/^#+\s+/gm, '')
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .trim();
        const firstParagraph = plainText.split('\n\n')[0] || plainText.substring(0, 200);
        excerpt = firstParagraph.length > 200 
          ? firstParagraph.substring(0, 197) + '...' 
          : firstParagraph;

        imageUrl = tipoPost === 'produto' && produtoAtual?.image_url 
          ? produtoAtual.image_url 
          : null;
      }

      if (!titulo || titulo.trim().length < 5) {
        setError('Título inválido para o post.');
        setIsPublishing(false);
        return;
      }

      // Criar post
      await createPost.mutateAsync({
        title: titulo,
        slug: slug,
        content: conteudoGerado,
        excerpt: excerpt,
        published: true, // Publicar automaticamente
        image_url: imageUrl,
      });

      setSuccess('Post publicado com sucesso!');
      setConteudoGerado('');
      setProdutosRelacionados([]);
      
      // Limpar formulário
      if (tipoPost === 'produto') {
        setProdutoSelecionado('');
      } else {
        setTemaNovidade('');
        setTemaCustomizado('');
      }

      setTimeout(() => setSuccess(null), 5000);

    } catch (err) {
      console.error('[AutoPublishBlog] Erro ao publicar:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Erro ao publicar o post.'
      );
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Card className="w-full border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Publicação Automática de Posts
        </CardTitle>
        <CardDescription>
          Gere e publique posts automaticamente sobre produtos ou novidades de tecnologia usando IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de Post */}
        <div>
          <Label className="text-base font-semibold mb-3 block">Tipo de Post</Label>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={tipoPost === 'produto' ? 'default' : 'outline'}
              onClick={() => {
                setTipoPost('produto');
                setTemaNovidade('');
                setTemaCustomizado('');
                setConteudoGerado('');
                setError(null);
                setSuccess(null);
              }}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <Package className="h-5 w-5" />
              <span>Produto</span>
            </Button>
            <Button
              variant={tipoPost === 'novidade' ? 'default' : 'outline'}
              onClick={() => {
                setTipoPost('novidade');
                setProdutoSelecionado('');
                setConteudoGerado('');
                setError(null);
                setSuccess(null);
              }}
              className="h-auto py-4 flex flex-col items-center gap-2"
            >
              <TrendingUp className="h-5 w-5" />
              <span>Novidade Tech</span>
            </Button>
          </div>
        </div>

        {/* Formulário baseado no tipo */}
        {tipoPost === 'produto' ? (
          <div>
            <Label htmlFor="produto" className="text-base font-semibold mb-2 block">
              Selecionar Produto
            </Label>
            {isLoadingProdutos ? (
              <div className="text-sm text-muted-foreground">Carregando produtos...</div>
            ) : (
              <Select
                value={produtoSelecionado}
                onValueChange={setProdutoSelecionado}
                disabled={isGenerating}
              >
                <SelectTrigger id="produto">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos?.map((produto) => (
                    <SelectItem key={produto.id} value={produto.id}>
                      {produto.title} - R$ {produto.current_price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {produtoAtual && (
              <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                <p className="font-semibold mb-1">{produtoAtual.title}</p>
                <p className="text-muted-foreground line-clamp-2">{produtoAtual.description}</p>
                <p className="text-primary font-semibold mt-2">
                  R$ {produtoAtual.current_price.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="tema-novidade" className="text-base font-semibold mb-2 block">
                Tema da Novidade
              </Label>
              <Select
                value={temaNovidade}
                onValueChange={(value) => {
                  setTemaNovidade(value);
                  setTemaCustomizado('');
                }}
                disabled={isGenerating}
              >
                <SelectTrigger id="tema-novidade">
                  <SelectValue placeholder="Selecione um tema ou digite um customizado" />
                </SelectTrigger>
                <SelectContent>
                  {temasNovidades.map((tema, index) => (
                    <SelectItem key={index} value={tema}>
                      {tema}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tema-customizado" className="text-sm text-muted-foreground mb-2 block">
                Ou digite um tema customizado
              </Label>
              <Input
                id="tema-customizado"
                type="text"
                value={temaCustomizado}
                onChange={(e) => {
                  setTemaCustomizado(e.target.value);
                  setTemaNovidade('');
                }}
                placeholder="Ex: Lançamento da nova GPU NVIDIA RTX 5090"
                disabled={isGenerating}
              />
            </div>
          </div>
        )}

        {/* Produtos Relacionados Encontrados */}
        {produtosRelacionados.length > 0 && (
          <div>
            <Label className="text-sm font-semibold mb-2 block">
              Produtos Relacionados que serão incluídos ({produtosRelacionados.length})
            </Label>
            <div className="flex flex-wrap gap-2">
              {produtosRelacionados.map((produto) => (
                <Badge key={produto.id} variant="secondary">
                  {produto.title}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Mensagens de Erro */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Mensagem de Sucesso */}
        {success && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-3">
          <Button
            onClick={handleGerar}
            disabled={
              isGenerating || 
              (tipoPost === 'produto' && !produtoSelecionado) ||
              (tipoPost === 'novidade' && !temaNovidade && !temaCustomizado.trim())
            }
            className="flex-1"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar Conteúdo
              </>
            )}
          </Button>

          {conteudoGerado && (
            <Button
              onClick={handlePublicar}
              disabled={isPublishing}
              variant="default"
              className="flex-1"
              size="lg"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Publicar Agora
                </>
              )}
            </Button>
          )}
        </div>

        {/* Preview do Conteúdo Gerado */}
        {conteudoGerado && (
          <div className="mt-6">
            <Label className="text-sm font-semibold mb-2 block">Preview do Conteúdo</Label>
            <div className="p-4 bg-muted/30 rounded-lg border border-border/50 max-h-96 overflow-y-auto">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-xs font-mono">
                  {conteudoGerado.substring(0, 1000)}
                  {conteudoGerado.length > 1000 && '...'}
                </pre>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {conteudoGerado.length} caracteres gerados
            </p>
          </div>
        )}

        {/* Aviso */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            ⚠️ O conteúdo gerado por IA será publicado automaticamente. Revise antes de publicar.
            Os posts incluem links de produtos relacionados automaticamente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

