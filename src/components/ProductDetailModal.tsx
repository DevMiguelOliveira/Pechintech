import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, MessageCircle, Send, User, Trash2, Share2, Shield, Copy } from 'lucide-react';
import { BuyButton } from '@/components/BuyButton';
import { openAffiliateUrl } from '@/utils/urlValidator';
import { sanitizeText } from '@/utils/security';
import { shareProduct } from '@/utils/share';
import { trackShare } from '@/services/analytics';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Thermometer } from '@/components/Thermometer';
import { Product, Comment } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { trackPromoClick } from '@/services/analytics';
import { toast } from '@/hooks/use-toast';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onDeleteComment?: (commentId: string) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onVoteHot,
  onVoteCold,
  comments,
  onAddComment,
  onDeleteComment,
}: ProductDetailModalProps) {
  const [newComment, setNewComment] = useState('');
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!product) return null;

  const discount = Math.round(
    ((product.original_price - product.current_price) / product.original_price) * 100
  );

  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
  };

  const handleShare = async () => {
    trackShare(product.id, 'share');
    await shareProduct(product, (method) => {
      trackShare(product.id, method);
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[360px] sm:max-w-[420px] md:max-w-[480px] lg:max-w-[520px] p-0 gap-0 bg-card overflow-hidden">
        {/* Product Image */}
        <div className="relative h-24 sm:h-28 md:h-32 lg:h-36 w-full overflow-hidden bg-muted/30">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain"
            loading="eager"
          />
          {discount > 0 && (
            <Badge className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary text-primary-foreground text-[11px] sm:text-sm font-bold px-1.5 py-0.5">
              -{discount}%
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 sm:p-3 md:p-4 space-y-2 sm:space-y-2.5 md:space-y-3">
          {/* Badges */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[9px] sm:text-[10px] md:text-xs h-4 sm:h-5 px-1.5">
              <Store className="h-2 w-2 sm:h-2.5 sm:w-2.5 mr-0.5" />
              {product.store}
            </Badge>
            <Badge variant="secondary" className="capitalize text-[9px] sm:text-[10px] md:text-xs h-4 sm:h-5 px-1.5">
              {product.category}
            </Badge>
          </div>

          {/* Title */}
          <DialogTitle className="text-sm sm:text-base md:text-lg font-bold leading-tight line-clamp-2">
            {product.title}
          </DialogTitle>

          {/* Description */}
          <p className="text-[11px] sm:text-sm md:text-base text-muted-foreground line-clamp-2">
            {product.description}
          </p>

          {/* Price & Savings - Enhanced */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] sm:text-[11px] md:text-sm text-muted-foreground line-through">
                {formatPrice(product.original_price)}
              </span>
              <Badge variant="outline" className="text-[9px] px-1.5 py-0.5 bg-green-500/10 text-green-600 border-green-500/30">
                Economize {formatPrice(product.original_price - product.current_price)}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl md:text-3xl font-black text-green-600 leading-none">
                {formatPrice(product.current_price)}
              </span>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80 px-2 py-1 bg-muted/30 rounded-lg border border-border/30">
            <Shield className="h-3 w-3 shrink-0" />
            <span>Link afiliado • Ganhamos comissão sem custo extra para você</span>
          </div>

          {/* Main CTA - Padronizado */}
          <BuyButton
            discount={discount}
            onClick={() => {
              trackPromoClick({
                id: product.id,
                title: product.title,
                store: product.store,
                price: product.current_price,
                category: product.category,
              });
              // Abre URL de forma segura com validação
              openAffiliateUrl(product.affiliate_url);
            }}
            size="lg"
            variant="modal"
          />

          {/* Secondary Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-10 hover:bg-green-500/10 hover:border-green-500/50"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-2 text-green-500" />
              Compartilhar
            </Button>
            {product.coupon_code && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-10 border-primary/30 hover:bg-primary/10"
                onClick={() => {
                  navigator.clipboard.writeText(product.coupon_code!);
                  toast({
                    title: 'Cupom copiado!',
                    description: `Código "${product.coupon_code}" copiado.`,
                  });
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Cupom
              </Button>
            )}
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

          {/* Specs - only show on larger screens */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="hidden sm:block">
              <Separator className="bg-border/50 my-2" />
              <h4 className="text-[10px] md:text-xs font-semibold mb-1">Especificações</h4>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="rounded bg-surface-elevated px-1.5 py-0.5">
                    <div className="text-[8px] md:text-[9px] text-muted-foreground">{key}</div>
                    <div className="font-medium text-[9px] md:text-[10px]">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section */}
          <Separator className="bg-border/50" />
          <div>
            <h4 className="text-[11px] sm:text-sm font-semibold mb-1.5 flex items-center gap-1">
              <MessageCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Comentários ({comments.length})
            </h4>

            {/* Add Comment */}
            <div className="flex gap-1 sm:gap-1.5 mb-1.5">
              <Input
                placeholder="Comentar..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                className="bg-surface-elevated border-border/50 text-[11px] sm:text-sm h-7 sm:h-8"
              />
              <Button
                variant="default"
                size="icon"
                onClick={handleSubmitComment}
                disabled={!newComment.trim()}
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
              >
                <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Button>
            </div>

            {/* Comments List - limited to 3 visible */}
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground text-[10px] sm:text-[11px] py-1.5">
                  Seja o primeiro a comentar!
                </p>
              ) : (
                comments.slice(0, 5).map((comment) => {
                  const canDelete = isAdmin || (user && user.id === comment.user_id);
                  return (
                    <div key={comment.id} className="rounded bg-surface-elevated p-1 sm:p-1.5 group">
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User className="w-1.5 h-1.5 sm:w-2 sm:h-2 text-primary" />
                        </div>
                        <span className="font-medium text-[9px] sm:text-[10px] truncate">
                          {comment.profile?.username || 'Usuário'}
                        </span>
                        {isAdmin && comment.user_id !== user?.id && (
                          <Badge variant="outline" className="text-[7px] h-3 px-1 text-primary border-primary/30">
                            Admin
                          </Badge>
                        )}
                        <span className="text-[8px] sm:text-[9px] text-muted-foreground ml-auto shrink-0">
                          {formatDate(comment.created_at)}
                        </span>
                        {canDelete && onDeleteComment && (
                          <button
                            onClick={() => onDeleteComment(comment.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-destructive/20 rounded"
                            title="Excluir comentário"
                          >
                            <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-destructive" />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] line-clamp-2">{comment.content}</p>
                    </div>
                  );
                })
              )}
              {comments.length > 5 && (
                <p className="text-center text-muted-foreground text-[9px] sm:text-[10px]">
                  +{comments.length - 5} comentários
                </p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
