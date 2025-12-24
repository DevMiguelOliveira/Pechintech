import { useParams, Link, useNavigate } from 'react-router-dom';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ArrowLeft, ExternalLink, Store, Share2, Copy, Check, Shield, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Thermometer } from '@/components/Thermometer';
import { SEO } from '@/components/SEO';
import { getProductStructuredData } from '@/config/seo';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { trackPromoClick, trackCouponCopy, trackShare } from '@/services/analytics';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVotes';
import { useComments, useAddComment } from '@/hooks/useComments';
import { Input } from '@/components/ui/input';
import { Send, MessageCircle, User } from 'lucide-react';
import { useState } from 'react';
import { LeadCapture } from '@/components/LeadCapture';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { FAQSection } from '@/components/FAQSection';
import { useTrackPageView } from '@/hooks/usePageViews';

const Product = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: dbProducts, isLoading } = useActiveProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  const vote = useVote();
  const addComment = useAddComment();
  const [newComment, setNewComment] = useState('');
  const [copied, setCopied] = useState(false);

  useTrackPageView(`/produto/${slug}`);

  const product = useMemo((): DbProduct | null => {
    if (!dbProducts || !slug) return null;
    // Tentar buscar por ID direto primeiro
    const byId = dbProducts.find(p => p.id === slug);
    if (byId) return byId;
    
    // Extrair ID do slug (formato: titulo-produto-abc12345)
    const idMatch = slug.match(/-([a-f0-9-]+)$/i);
    if (idMatch) {
      const partialId = idMatch[1];
      const found = dbProducts.find(p => p.id.includes(partialId));
      if (found) return found;
    }
    
    // Fallback: buscar por título
    const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ');
    return dbProducts.find(p => {
      const normalizedTitle = p.title.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '');
      return normalizedTitle.includes(normalizedSlug) || normalizedSlug.includes(normalizedTitle);
    }) || null;
  }, [dbProducts, slug]);

  const { data: comments = [] } = useComments(product?.id || '');

  const discount = product ? Math.round(
    ((Number(product.original_price) - Number(product.current_price)) / Number(product.original_price)) * 100
  ) : 0;

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handlePromoClick = () => {
    if (!product) return;
    trackPromoClick({
      id: product.id,
      title: product.title,
      store: product.store,
      price: Number(product.current_price),
      category: product.categories?.slug || 'hardware',
    });
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyCoupon = async () => {
    if (!product?.coupon_code) return;
    try {
      await navigator.clipboard.writeText(product.coupon_code);
      setCopied(true);
      trackCouponCopy(product.id, product.coupon_code);
      toast({
        title: 'Cupom copiado!',
        description: `Código "${product.coupon_code}" copiado.`,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Erro ao copiar',
        variant: 'destructive',
      });
    }
  };

  const handleShareWhatsApp = () => {
    if (!product) return;
    const message = `🔥 *PROMOÇÃO IMPERDÍVEL!* 🔥\n\n*${product.title}*\n\n💰 De ~R$ ${product.original_price}~ por apenas:\n✅ *R$ ${product.current_price}* (-${discount}%)\n\n🏪 Loja: ${product.store}\n${product.coupon_code ? `🎫 Cupom: *${product.coupon_code}*\n` : ''}\n🔗 Confira: ${product.affiliate_url}\n\n_Encontrado no PechinTech_`;
    trackShare(product.id, 'whatsapp');
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddComment = () => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Entre na sua conta para comentar.',
      });
      navigate('/auth');
      return;
    }
    if (!product || !newComment.trim()) return;
    addComment.mutate({ productId: product.id, content: newComment.trim() });
    setNewComment('');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Skeleton className="h-10 w-32 mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h1 className="text-4xl font-bold mb-4">Produto não encontrado</h1>
        <p className="text-muted-foreground mb-6">
          O produto que você está procurando não existe ou foi removido.
        </p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Promoções
          </Link>
        </Button>
      </div>
    );
  }

  const savings = Number(product.original_price) - Number(product.current_price);
  const productStructuredData = getProductStructuredData({
    id: product.id,
    title: product.title,
    description: product.description,
    image_url: product.image_url,
    current_price: Number(product.current_price),
    original_price: Number(product.original_price),
    affiliate_url: product.affiliate_url,
    category: product.categories?.slug || 'hardware',
    store: product.store,
    hot_votes: product.hot_votes,
    cold_votes: product.cold_votes,
    coupon_code: product.coupon_code,
  });

  const faqData = [
    {
      question: `Vale a pena comprar ${product.title}?`,
      answer: `Sim! Este produto está com ${discount}% de desconto, economizando ${formatPrice(savings)}. A oferta foi avaliada por ${product.hot_votes + product.cold_votes} pessoas da comunidade. Recomendamos comparar preços e ler as especificações antes de comprar.`,
    },
    {
      question: `Onde comprar ${product.title} barato e confiável?`,
      answer: `Você pode comprar ${product.title} na ${product.store} através do link acima. Esta é uma loja parceira verificada. O link é afiliado, então ganhamos uma pequena comissão sem custo adicional para você.`,
    },
    {
      question: `Qual o melhor custo-benefício para ${product.title}?`,
      answer: `Considerando o preço atual de ${formatPrice(Number(product.current_price))} (desconto de ${discount}%), esta é uma excelente oportunidade. A comunidade avaliou positivamente esta oferta. Sempre verifique se o produto atende suas necessidades antes de comprar.`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${product.title} - Promoção ${discount}% OFF | PechinTech`}
        description={`${product.title} por apenas ${formatPrice(Number(product.current_price))}! Economize ${formatPrice(savings)} (${discount}% de desconto). ${product.coupon_code ? `Cupom: ${product.coupon_code}. ` : ''}Avaliado por ${product.hot_votes + product.cold_votes} pessoas. Confira agora!`}
        keywords={`${product.title}, ${product.title} promoção, ${product.title} barato, ${product.title} desconto, ${product.categories?.name || product.category}, ${product.store}, cupom ${product.title}`}
        image={product.image_url}
        url={`/produto/${slug}`}
        type="product"
        structuredData={productStructuredData}
        breadcrumbs={[
          { name: 'Início', url: '/' },
          { name: product.categories?.name || 'Produtos', url: `/?category=${product.categories?.slug || product.category}` },
          { name: product.title, url: `/produto/${slug}` },
        ]}
        faqData={faqData}
      />

      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Promoções
          </Link>
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="aspect-square bg-muted/30 p-8 flex items-center justify-center">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  loading="eager"
                />
              </div>
            </Card>
            {discount > 0 && (
              <Badge className="w-full justify-center text-lg font-black py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white">
                <Sparkles className="h-5 w-5 mr-2" />
                -{discount}% DE DESCONTO
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-primary">Início</Link>
              <span>/</span>
              <Link to={`/?category=${product.categories?.slug || product.category}`} className="hover:text-primary capitalize">
                {product.categories?.name || product.category}
              </Link>
              <span>/</span>
              <span className="line-clamp-1">{product.title}</span>
            </div>

            {/* Title - H1 */}
            <h1 className="text-3xl md:text-4xl font-black leading-tight">
              {product.title}
            </h1>

            {/* Description */}
            <p className="text-lg text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            {/* Store & Category */}
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <Store className="h-4 w-4 mr-2" />
                {product.store}
              </Badge>
              <Badge variant="secondary" className="text-sm px-4 py-2 capitalize">
                {product.categories?.name || product.category}
              </Badge>
            </div>

            {/* Price Section */}
            <div className="space-y-3 p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20">
              <div className="flex items-baseline gap-3">
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(Number(product.original_price))}
                </span>
                {savings > 0 && (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                    Economize {formatPrice(savings)}
                  </Badge>
                )}
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-black text-primary">
                  {formatPrice(Number(product.current_price))}
                </span>
                {discount > 0 && (
                  <span className="text-lg text-muted-foreground">
                    ou {formatPrice(Math.round(Number(product.current_price) / 12))}/mês
                  </span>
                )}
              </div>
            </div>

            {/* Trust Badge */}
            <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg border border-border/30">
              <Shield className="h-5 w-5 text-primary shrink-0" />
              <span className="text-sm text-muted-foreground">
                <strong>Link afiliado:</strong> Ganhamos uma pequena comissão quando você compra, sem custo adicional para você. Isso nos ajuda a manter o site gratuito e encontrar mais promoções.
              </span>
            </div>

            {/* Main CTA */}
            <Button
              size="lg"
              className={cn(
                "w-full h-16 text-lg font-black rounded-xl",
                "bg-gradient-to-r from-green-600 via-green-500 to-emerald-500",
                "hover:from-green-500 hover:via-green-400 hover:to-emerald-400",
                "shadow-2xl hover:shadow-green-500/50",
                "text-white"
              )}
              onClick={handlePromoClick}
            >
              <ExternalLink className="h-6 w-6 mr-3" />
              {discount >= 30 ? '🔥 COMPRAR COM DESCONTO AGORA' : 'COMPRAR AGORA'}
              <TrendingUp className="h-6 w-6 ml-3" />
            </Button>

            {/* Coupon Code */}
            {product.coupon_code && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold mb-1">Cupom de Desconto</p>
                      <p className="text-2xl font-black font-mono text-primary uppercase">
                        {product.coupon_code}
                      </p>
                    </div>
                    <Button
                      onClick={handleCopyCoupon}
                      variant="outline"
                      size="lg"
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-5 w-5 mr-2 text-green-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-5 w-5 mr-2" />
                          Copiar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Secondary Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShareWhatsApp}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
              <WhatsAppCTA variant="inline" className="flex-1" />
            </div>

            {/* Thermometer */}
            <div className="p-4 bg-card rounded-lg border">
              <Thermometer
                temperature={product.temperature}
                hotVotes={product.hot_votes}
                coldVotes={product.cold_votes}
                onVoteHot={() => {
                  if (!user) {
                    toast({ title: 'Faça login para votar' });
                    navigate('/auth');
                    return;
                  }
                  vote.mutate({ productId: product.id, voteType: 'hot' });
                }}
                onVoteCold={() => {
                  if (!user) {
                    toast({ title: 'Faça login para votar' });
                    navigate('/auth');
                    return;
                  }
                  vote.mutate({ productId: product.id, voteType: 'cold' });
                }}
              />
            </div>
          </div>
        </div>

        {/* Specs */}
        {product.specs && Object.keys(product.specs).length > 0 && (
          <Card className="mb-12">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Especificações Técnicas</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-border/50">
                    <span className="font-semibold text-muted-foreground">{key}:</span>
                    <span className="text-right">{value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="h-6 w-6" />
              Comentários ({comments.length})
            </h2>
            
            {/* Add Comment */}
            <div className="flex gap-2 mb-6">
              <Input
                placeholder="Deixe seu comentário..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1"
              />
              <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Enviar
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Seja o primeiro a comentar!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-semibold">
                        {comment.profile?.username || 'Usuário'}
                      </span>
                      <span className="text-sm text-muted-foreground ml-auto">
                        {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <FAQSection faqs={faqData} className="mb-12" />

        {/* Lead Capture */}
        <LeadCapture variant="inline" productTitle={product.title} />
      </div>

      {/* WhatsApp Floating */}
      <WhatsAppCTA variant="floating" />
    </div>
  );
};

export default Product;

