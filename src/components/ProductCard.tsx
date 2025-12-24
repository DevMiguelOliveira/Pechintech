import { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, Store, Copy, Check, Share2, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer } from '@/components/Thermometer';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { trackPromoClick, trackCouponCopy, trackShare, trackProductView } from '@/services/analytics';

interface ProductCardProps {
  product: Product;
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  isFavorite?: boolean;
}

export function ProductCard({
  product,
  onOpenDetails,
  onToggleFavorite,
  onVoteHot,
  onVoteCold,
  isFavorite = false,
}: ProductCardProps) {
  const [copied, setCopied] = useState(false);
  
  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleCopyCoupon = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.coupon_code) {
      try {
        await navigator.clipboard.writeText(product.coupon_code);
        setCopied(true);
        toast({
          title: 'Cupom copiado!',
          description: `Código "${product.coupon_code}" copiado para a área de transferência.`,
        });
        // Analytics: tracking de cópia de cupom
        trackCouponCopy(product.id, product.coupon_code);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast({
          title: 'Erro ao copiar',
          description: 'Não foi possível copiar o cupom.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const discount = Math.round(
      ((product.original_price - product.current_price) / product.original_price) * 100
    );
    
    let message = `🔥 *PROMOÇÃO IMPERDÍVEL!* 🔥\n\n`;
    message += `*${product.title}*\n\n`;
    message += `💰 De ~R$ ${product.original_price.toFixed(2)}~ por apenas:\n`;
    message += `✅ *R$ ${product.current_price.toFixed(2)}* (-${discount}%)\n\n`;
    message += `🏪 Loja: ${product.store}\n`;
    
    if (product.coupon_code) {
      message += `🎫 Cupom: *${product.coupon_code}*\n`;
    }
    
    message += `\n🔗 Confira: ${product.affiliate_url}\n\n`;
    message += `_Encontrado no PechinTech - As melhores promoções de tecnologia!_`;
    
    // Analytics: tracking de compartilhamento
    trackShare(product.id, 'whatsapp');
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  const handleCardClick = () => {
    // Analytics: tracking de visualização de produto
    trackProductView({
      id: product.id,
      title: product.title,
      price: product.current_price,
      category: product.category,
    });
    onOpenDetails(product);
  };
  
  const handlePromoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Analytics: tracking de clique no link de afiliado
    trackPromoClick({
      id: product.id,
      title: product.title,
      store: product.store,
      price: product.current_price,
      category: product.category,
    });
    window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
  };

  const isHotDeal = discount >= 30 || product.temperature > 70;
  const savings = product.original_price - product.current_price;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl bg-gradient-to-br from-card to-card/50 overflow-hidden',
        'border-2 transition-all duration-500 ease-out',
        'hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20',
        'hover:-translate-y-2 hover:scale-[1.02]',
        isHotDeal ? 'border-primary/30 shadow-lg shadow-primary/10' : 'border-border/50',
        'h-full backdrop-blur-sm'
      )}
      onClick={handleCardClick}
    >
      {/* Gradient Overlay for Hot Deals */}
      {isHotDeal && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none z-0" />
      )}

      {/* Animated Background Glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />

      {/* Discount Badge - Enhanced */}
      {discount > 0 && (
        <div className="absolute top-3 left-3 z-20">
          <Badge
            className={cn(
              'font-black shadow-2xl text-xs sm:text-sm px-3 py-1.5',
              'bg-gradient-to-r from-red-500 to-orange-500 text-white',
              'border-2 border-white/20 backdrop-blur-sm',
              'animate-pulse hover:animate-none',
              discount >= 50 && 'from-red-600 to-pink-600 scale-110'
            )}
          >
            <Sparkles className="h-3 w-3 mr-1 inline" />
            -{discount}% OFF
          </Badge>
        </div>
      )}

      {/* Favorite Button - Enhanced */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'absolute top-3 right-3 z-20 rounded-full',
          'bg-background/90 backdrop-blur-md border border-border/50',
          'hover:bg-primary hover:text-primary-foreground hover:scale-110',
          'hover:border-primary transition-all duration-300',
          'h-9 w-9 shadow-lg',
          isFavorite && 'bg-primary text-primary-foreground border-primary scale-110'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        aria-label={isFavorite ? `Remover ${product.title} dos favoritos` : `Adicionar ${product.title} aos favoritos`}
      >
        <Heart className={cn('h-4 w-4 transition-all', isFavorite && 'fill-current scale-110')} aria-hidden="true" />
      </Button>

      {/* Product Image - Enhanced */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/5 group/image">
        {/* Hot Deal Badge on Image */}
        {isHotDeal && (
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Zap className="h-3 w-3 text-yellow-300" />
            <span className="text-[10px] font-bold text-white">HOT DEAL</span>
          </div>
        )}
        
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className={cn(
            'w-full h-full object-contain p-3 sm:p-4 transition-all duration-500',
            'group-hover:scale-110 group-hover:brightness-110'
          )}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        
        {/* Image Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content - Enhanced */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3 relative z-10">
        {/* Store & Category Badges - Enhanced */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge 
            variant="outline" 
            className="text-xs font-semibold px-2.5 py-1 bg-background/80 backdrop-blur-sm border-primary/30"
          >
            <Store className="h-3 w-3 mr-1.5" />
            {product.store}
          </Badge>
          <Badge 
            variant="secondary" 
            className="text-xs font-semibold px-2.5 py-1 capitalize bg-primary/10 text-primary border-primary/20"
          >
            {product.category}
          </Badge>
        </div>

        {/* Title - Enhanced */}
        <h3 className="font-bold text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300 min-h-[3em]">
          {product.title}
        </h3>

        {/* Price Section - Enhanced with Savings Highlight */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs sm:text-sm text-muted-foreground line-through font-medium">
              {formatPrice(product.original_price)}
            </span>
            {savings > 0 && (
              <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-green-500/10 text-green-600 border-green-500/30">
                Economize {formatPrice(savings)}
              </Badge>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-primary leading-none">
              {formatPrice(product.current_price)}
            </span>
            {discount > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                ou {formatPrice(Math.round(product.current_price / 12))}/mês
              </span>
            )}
          </div>
        </div>

        {/* Thermometer - Enhanced */}
        <div className="py-2">
          <Thermometer
            temperature={product.temperature}
            hotVotes={product.hot_votes}
            coldVotes={product.cold_votes}
            onVoteHot={() => onVoteHot(product.id)}
            onVoteCold={() => onVoteCold(product.id)}
            size="sm"
          />
        </div>

        {/* Coupon Code - Enhanced */}
        {product.coupon_code && (
          <button
            onClick={handleCopyCoupon}
            className={cn(
              "w-full flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl",
              "bg-gradient-to-r from-primary/20 to-primary/10 border-2 border-primary/30",
              "hover:from-primary/30 hover:to-primary/20 hover:border-primary/50",
              "transition-all duration-300 hover:scale-[1.02]",
              "text-sm font-semibold group/coupon"
            )}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Cupom:</span>
            </div>
            <span className="font-mono font-black text-primary text-base uppercase tracking-wider">
              {product.coupon_code}
            </span>
            {copied ? (
              <Check className="h-5 w-5 text-green-500 shrink-0 animate-in zoom-in" />
            ) : (
              <Copy className="h-4 w-4 text-muted-foreground shrink-0 group-hover/coupon:text-primary transition-colors" />
            )}
          </button>
        )}

        {/* Main CTA Button - Enhanced */}
        <Button
          variant="default"
          className={cn(
            "w-full h-12 sm:h-14 text-base sm:text-lg font-black rounded-xl",
            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary",
            "shadow-lg hover:shadow-xl hover:shadow-primary/50",
            "transition-all duration-300 hover:scale-105 hover:-translate-y-0.5",
            "border-2 border-primary/20 hover:border-primary/40",
            "group/cta relative overflow-hidden"
          )}
          onClick={handlePromoClick}
          aria-label={`Ver oferta de ${product.title} na ${product.store}`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <ExternalLink className="h-5 w-5 group-hover/cta:translate-x-1 transition-transform" aria-hidden="true" />
            <span>VER OFERTA AGORA</span>
            <TrendingUp className="h-5 w-5 group-hover/cta:translate-x-1 transition-transform" aria-hidden="true" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/cta:translate-x-[100%] transition-transform duration-1000" />
        </Button>

        {/* Secondary Actions - Enhanced */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            <span className="text-xs font-medium">{product.comments_count} comentários</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs hover:bg-green-500/10 hover:text-green-600 hover:border-green-500/30 border border-transparent hover:border transition-all"
            onClick={handleShareWhatsApp}
            aria-label={`Compartilhar ${product.title} no WhatsApp`}
          >
            <Share2 className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
            Compartilhar
          </Button>
        </div>

        {/* Published Date - Subtle */}
        <p className="text-[10px] text-muted-foreground/70 text-center pt-1">
          Publicado em {formatDate(product.created_at)}
        </p>
      </div>
    </article>
  );
}
