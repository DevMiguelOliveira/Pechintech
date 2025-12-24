import { Package } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

interface ProductGridProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  favorites: Set<string>;
  title?: string;
}

export function ProductGrid({
  products,
  onOpenDetails,
  onToggleFavorite,
  onVoteHot,
  onVoteCold,
  favorites,
  title = 'Todas as Promoções',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Nenhuma promoção encontrada</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Tente ajustar os filtros ou buscar por outros termos.
        </p>
      </div>
    );
  }

  return (
    <section className="py-6 md:py-8 lg:py-10" itemScope itemType="https://schema.org/ItemList">
      {title && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent" itemProp="name">
            {title}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          <meta itemProp="description" content={`Lista de ${products.length} promoções de tecnologia verificadas pela comunidade`} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4"
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'both',
            }}
          >
            <ProductCard
              product={product}
              onOpenDetails={onOpenDetails}
              onToggleFavorite={onToggleFavorite}
              onVoteHot={onVoteHot}
              onVoteCold={onVoteCold}
              isFavorite={favorites.has(product.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
