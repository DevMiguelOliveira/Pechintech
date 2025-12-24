import { Package } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface ProductGridProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  favorites: Set<string>;
  title?: string;
}

function AnimatedProductCard({
  product,
  index,
  onOpenDetails,
  onToggleFavorite,
  onVoteHot,
  onVoteCold,
  isFavorite,
}: {
  product: Product;
  index: number;
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  isFavorite: boolean;
}) {
  const { elementRef, isVisible } = useScrollAnimation({
    threshold: 0.1,
    rootMargin: '50px',
    once: true,
  });

  return (
    <div
      ref={elementRef}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-8'
      )}
      style={{
        transitionDelay: `${Math.min(index * 100, 1000)}ms`,
      }}
    >
      <ProductCard
        product={product}
        onOpenDetails={onOpenDetails}
        onToggleFavorite={onToggleFavorite}
        onVoteHot={onVoteHot}
        onVoteCold={onVoteCold}
        isFavorite={isFavorite}
      />
    </div>
  );
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
        <h3 className="text-lg sm:text-xl font-semibold mb-2 leading-tight">Nenhuma promoção encontrada</h3>
        <p className="text-muted-foreground text-[0.875rem] sm:text-base max-w-sm leading-relaxed">
          Tente ajustar os filtros ou buscar por outros termos.
        </p>
      </div>
    );
  }

  return (
    <section 
      className="py-6 md:py-8 lg:py-10" 
      itemScope 
      itemType="https://schema.org/ItemList"
    >
      {title && (
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-[1.75rem] md:text-[2rem] lg:text-[2.25rem] xl:text-[2.5rem] font-black mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-[1.2] tracking-tight" itemProp="name">
            {title}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          <meta itemProp="description" content={`Lista de ${products.length} promoções de tecnologia verificadas pela comunidade`} />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5 lg:gap-6">
        {products.map((product, index) => (
          <AnimatedProductCard
            key={product.id}
            product={product}
            index={index}
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
