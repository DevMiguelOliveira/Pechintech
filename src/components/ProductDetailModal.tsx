import { useState } from 'react';
import { X, ExternalLink, Store, MessageCircle, Send, User } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Thermometer } from '@/components/Thermometer';
import { Product, Comment } from '@/types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  comments: Comment[];
  onAddComment: (content: string) => void;
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onVoteHot,
  onVoteCold,
  comments,
  onAddComment,
}: ProductDetailModalProps) {
  const [newComment, setNewComment] = useState('');

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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 gap-0 bg-card overflow-hidden">
        <ScrollArea className="max-h-[90vh]">
          <div className="relative">
            {/* Product Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-muted/30 flex items-center justify-center">
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-contain p-4"
                loading="eager"
                width={800}
                height={450}
                style={{ maxWidth: '100%', maxHeight: '100%' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                  target.className = 'w-full h-full object-contain p-4 opacity-50';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
              
              {/* Discount Badge */}
              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground text-lg font-bold px-3 py-1">
                  -{discount}%
                </Badge>
              )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    <Store className="h-3 w-3 mr-1" />
                    {product.store}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">
                    {product.category}
                  </Badge>
                </div>

                <DialogTitle className="text-2xl font-bold leading-tight">
                  {product.title}
                </DialogTitle>

                <p className="text-muted-foreground">{product.description}</p>
              </div>

              {/* Price & Thermometer */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.original_price)}
                  </span>
                  <div className="text-3xl font-bold text-primary">
                    {formatPrice(product.current_price)}
                  </div>
                  <Button
                    variant="neon"
                    size="lg"
                    className="w-full mt-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    onClick={() => window.open(product.affiliate_url, '_blank', 'noopener,noreferrer')}
                    aria-label={`Ir para ${product.store} comprar ${product.title}`}
                  >
                    <ExternalLink className="h-5 w-5" aria-hidden="true" />
                    Pegar Promoção
                  </Button>
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Temperatura da Oferta</span>
                  <Thermometer
                    temperature={product.temperature}
                    hotVotes={product.hot_votes}
                    coldVotes={product.cold_votes}
                    onVoteHot={() => onVoteHot(product.id)}
                    onVoteCold={() => onVoteCold(product.id)}
                    size="lg"
                  />
                </div>
              </div>

              {/* Specs */}
              {product.specs && Object.keys(product.specs).length > 0 && (
                <>
                  <Separator className="bg-border/50" />
                  <div>
                    <h4 className="font-semibold mb-3">Especificações</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-surface-elevated p-3"
                        >
                          <div className="text-xs text-muted-foreground">{key}</div>
                          <div className="font-medium text-sm">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Comments Section */}
              <Separator className="bg-border/50" />
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Comentários ({comments.length})
                </h4>

                {/* Add Comment */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Adicionar um comentário..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    className="bg-surface-elevated border-border/50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    aria-label="Campo de comentário"
                  />
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    aria-label="Enviar comentário"
                    className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <Send className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground text-sm py-6">
                      Seja o primeiro a comentar!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-lg bg-surface-elevated p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {comment.profile?.username || 'Usuário'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
