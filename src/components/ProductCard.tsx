import { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, Store, Copy, Check, Share2 } from 'lucide-react';
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

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl bg-card overflow-hidden cursor-pointer',
        'border border-border/50 transition-all duration-300',
        'hover:border-primary/30 hover:shadow-xl hover:-translate-y-1',
        'card-glow h-full'
      )}
      onClick={handleCardClick}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <Badge
          className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground font-bold shadow-lg text-[10px] px-1.5 py-0.5"
        >
          -{discount}%
        </Badge>
      )}

      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          'absolute top-2 right-2 z-10 rounded-full bg-background/80 backdrop-blur-sm',
          'hover:bg-background hover:scale-110 transition-all',
          'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'h-7 w-7',
          isFavorite && 'text-primary'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        aria-label={isFavorite ? `Remover ${product.title} dos favoritos` : `Adicionar ${product.title} aos favoritos`}
      >
        <Heart className={cn('h-3.5 w-3.5', isFavorite && 'fill-current')} aria-hidden="true" />
      </Button>

      {/* Product Image */}
      <div className="relative aspect-square max-h-36 sm:max-h-40 overflow-hidden bg-muted/30">
        <img
          src={product.image_url}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-2.5 sm:p-3 gap-1.5 sm:gap-2">
        {/* Store Badge */}
        <div className="flex items-center gap-1 flex-wrap">
          <Badge variant="outline" className="text-[9px] sm:text-[10px] font-normal px-1.5 py-0">
            <Store className="h-2.5 w-2.5 mr-0.5" />
            {product.store}
          </Badge>
          <Badge variant="secondary" className="text-[9px] sm:text-[10px] font-normal capitalize px-1.5 py-0">
            {product.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-[11px] sm:text-xs line-clamp-2 hover:text-primary transition-colors leading-snug min-h-[2.5em]">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex flex-col">
          <span className="text-[9px] sm:text-[10px] text-muted-foreground line-through leading-none">
            {formatPrice(product.original_price)}
          </span>
          <span className="text-sm sm:text-lg font-bold text-primary leading-tight">
            {formatPrice(product.current_price)}
          </span>
        </div>

        {/* Thermometer */}
        <Thermometer
          temperature={product.temperature}
          hotVotes={product.hot_votes}
          coldVotes={product.cold_votes}
          onVoteHot={() => onVoteHot(product.id)}
          onVoteCold={() => onVoteCold(product.id)}
          size="sm"
        />

        {/* Date & Actions - Pushed to bottom */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {/* Coupon Code */}
          {product.coupon_code && (
            <button
              onClick={handleCopyCoupon}
              className={cn(
                "w-full flex items-center justify-between gap-1 px-2 py-1 rounded-md",
                "bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors",
                "text-[9px] sm:text-[10px] font-medium"
              )}
            >
              <span className="text-muted-foreground">Cupom:</span>
              <span className="font-mono font-bold text-primary uppercase tracking-wider truncate max-w-[80px]">
                {product.coupon_code}
              </span>
              {copied ? (
                <Check className="h-2.5 w-2.5 text-green-500 shrink-0" />
              ) : (
                <Copy className="h-2.5 w-2.5 text-muted-foreground shrink-0" />
              )}
            </button>
          )}
          
          {/* Published Date */}
          <p className="text-[8px] sm:text-[9px] text-muted-foreground text-center leading-tight">
            Publicado em {formatDate(product.created_at)}. Valores sujeitos a alteração.
          </p>

          {/* Main Button */}
          <Button
            variant="neon"
            className="w-full text-[9px] sm:text-[10px] h-7 sm:h-8 px-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={handlePromoClick}
            aria-label={`Ver oferta de ${product.title} na ${product.store}`}
          >
            <ExternalLink className="h-3 w-3 shrink-0 mr-1" aria-hidden="true" />
            Pegar Promoção!
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex items-center justify-center gap-1.5">
            <div className="flex items-center gap-0.5 text-muted-foreground">
              <MessageCircle className="h-2.5 w-2.5" aria-hidden="true" />
              <span className="text-[8px] sm:text-[9px]">{product.comments_count}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-1.5 text-[8px] sm:text-[9px] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:bg-green-500/10 hover:border-green-500/50 text-green-500"
              onClick={handleShareWhatsApp}
              aria-label={`Compartilhar ${product.title} no WhatsApp`}
            >
              <Share2 className="h-2.5 w-2.5 mr-0.5" aria-hidden="true" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
