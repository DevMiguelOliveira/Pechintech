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
    <section className="py-4 md:py-6">
      {title && (
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4">{title}</h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onOpenDetails={onOpenDetails}
            onToggleFavorite={onToggleFavorite}
            onVoteHot={onVoteHot}
            onVoteCold={onVoteCold}
            isFavorite={favorites.has(product.id)}
          />
        ))}
      </div>
    </section>
  );
}
