import { useState } from 'react';
import { Heart, MessageCircle, ExternalLink, Store, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Thermometer } from '@/components/Thermometer';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

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
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  const handleCardClick = () => {
    onOpenDetails(product);
  };

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-xl bg-card overflow-hidden cursor-pointer',
        'border border-border/50 transition-all duration-300',
        'hover:border-primary/30 hover:shadow-xl hover:-translate-y-1',
        'card-glow'
      )}
      onClick={handleCardClick}
    >
      {/* Discount Badge */}
      {discount > 0 && (
        <Badge
          className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground font-bold shadow-lg"
        >
          -{discount}%
        </Badge>
      )}

      {/* Favorite Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          'absolute top-3 right-3 z-10 rounded-full bg-background/80 backdrop-blur-sm',
          'hover:bg-background hover:scale-110 transition-all',
          'focus:ring-2 focus:ring-primary focus:ring-offset-2',
          isFavorite && 'text-primary'
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(product.id);
        }}
        aria-label={isFavorite ? `Remover ${product.title} dos favoritos` : `Adicionar ${product.title} aos favoritos`}
      >
        <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} aria-hidden="true" />
      </Button>

      {/* Product Image */}
      <div className="relative h-32 sm:h-36 md:h-40 overflow-hidden bg-muted/30">
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
      <div className="flex flex-col flex-1 p-3 md:p-4 gap-2 md:gap-3">
        {/* Store Badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] md:text-xs font-normal">
            <Store className="h-2.5 w-2.5 md:h-3 md:w-3 mr-0.5 md:mr-1" />
            {product.store}
          </Badge>
          <Badge variant="secondary" className="text-[10px] md:text-xs font-normal capitalize">
            {product.category}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-xs md:text-sm line-clamp-2 hover:text-primary transition-colors leading-tight">
          {product.title}
        </h3>

        {/* Price */}
        <div className="flex flex-col gap-0">
          <span className="text-[10px] md:text-xs text-muted-foreground line-through">
            {formatPrice(product.original_price)}
          </span>
          <span className="text-base md:text-xl font-bold text-primary">
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

        {/* Coupon & Date Section */}
        <div className="space-y-1.5 pt-1">
          {/* Coupon Code */}
          {product.coupon_code && (
            <button
              onClick={handleCopyCoupon}
              className={cn(
                "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md",
                "bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors",
                "text-[10px] md:text-xs font-medium"
              )}
            >
              <span className="text-muted-foreground">Cupom:</span>
              <span className="font-mono font-bold text-primary uppercase tracking-wider">
                {product.coupon_code}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-green-500 shrink-0" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground shrink-0" />
              )}
            </button>
          )}
          
          {/* Published Date */}
          <p className="text-[9px] md:text-[10px] text-muted-foreground text-center leading-tight">
            Publicado em {formatDate(product.created_at)}. Valores sujeitos a alteração.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-1.5 mt-auto pt-1">
          {/* Main Button */}
          <Button
            variant="neon"
            className="w-full text-[10px] sm:text-xs h-8 sm:h-9 px-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation();
              window.open(product.affiliate_url, '_blank', 'noopener,noreferrer');
            }}
            aria-label={`Ver oferta de ${product.title} na ${product.store}`}
          >
            <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 mr-1" aria-hidden="true" />
            Pegar Promoção!
          </Button>
          
          {/* Secondary Actions */}
          <div className="flex items-center justify-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-3 w-3" aria-hidden="true" />
              <span className="text-[9px] sm:text-[10px]">{product.comments_count}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[9px] sm:text-[10px] focus:ring-2 focus:ring-green-500 focus:ring-offset-2 hover:bg-green-500/10 hover:border-green-500/50 text-green-500"
              onClick={handleShareWhatsApp}
              aria-label={`Compartilhar ${product.title} no WhatsApp`}
            >
              <Share2 className="h-3 w-3 mr-1" aria-hidden="true" />
              Compartilhar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
