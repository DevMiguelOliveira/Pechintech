import { Heart, X, ExternalLink, Trash2 } from 'lucide-react';
import { openAffiliateUrl } from '@/utils/urlValidator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Product } from '@/types';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Product[];
  onRemoveFavorite: (productId: string) => void;
  onOpenDetails: (product: Product) => void;
}

export function FavoritesDrawer({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  onOpenDetails,
}: FavoritesDrawerProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md bg-card border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary fill-current" />
            Meus Favoritos ({favorites.length})
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)] mt-6">
          {favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Heart className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum favorito</h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                Clique no coração das promoções para salvá-las aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {favorites.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-3 p-3 rounded-lg bg-surface-elevated border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-20 h-20 rounded-md object-cover shrink-0 cursor-pointer"
                    onClick={() => {
                      onClose();
                      onOpenDetails(product);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4
                      className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                      onClick={() => {
                        onClose();
                        onOpenDetails(product);
                      }}
                    >
                      {product.title}
                    </h4>
                    <div className="mt-1">
                      <span className="text-xs text-muted-foreground line-through mr-2">
                        {formatPrice(product.original_price)}
                      </span>
                      <span className="text-primary font-bold">
                        {formatPrice(product.current_price)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="neon"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => openAffiliateUrl(product.affiliate_url)}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Pegar
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveFavorite(product.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
