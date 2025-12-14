import { Flame, TrendingUp, Zap } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';

interface HeroSectionProps {
  trendingProducts: Product[];
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  favorites: Set<string>;
}

export function HeroSection({
  trendingProducts,
  onOpenDetails,
  onToggleFavorite,
  onVoteHot,
  onVoteCold,
  favorites,
}: HeroSectionProps) {
  return (
    <section className="relative py-4 md:py-8 lg:py-12">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyber-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Section Header */}
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg bg-gradient-to-br from-primary to-temperature-hot">
            <Flame className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold flex items-center gap-2">
              Promoções em Alta
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              As ofertas mais votadas pela comunidade
            </p>
          </div>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {trendingProducts.slice(0, 4).map((product) => (
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
      </div>
    </section>
  );
}
