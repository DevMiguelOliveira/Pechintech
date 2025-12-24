import { useEffect, useRef, useState, useCallback } from 'react';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HorizontalProductGridProps {
  products: Product[];
  onOpenDetails: (product: Product) => void;
  onToggleFavorite: (productId: string) => void;
  onVoteHot: (productId: string) => void;
  onVoteCold: (productId: string) => void;
  favorites: Set<string>;
  title?: string;
}

export function HorizontalProductGrid({
  products,
  onOpenDetails,
  onToggleFavorite,
  onVoteHot,
  onVoteCold,
  favorites,
  title = 'Todas as Promoções',
}: HorizontalProductGridProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  // Verificar se há scroll disponível
  const checkScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  // Scroll suave
  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // 80% da largura visível
    const targetScroll = direction === 'left' 
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;
    
    setIsScrolling(true);
    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
    
    setTimeout(() => {
      setIsScrolling(false);
      checkScrollButtons();
    }, 500);
  }, [checkScrollButtons]);

  // Scroll infinito com detecção de fim
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      checkScrollButtons();
      
      // Detectar quando está próximo do fim (80% do scroll)
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;
      
      if (scrollPercentage > 0.8 && !isScrolling) {
        // Aqui você pode implementar carregamento de mais produtos se necessário
        // Por enquanto, apenas anima o scroll
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', checkScrollButtons);
    
    // Verificar inicialmente
    checkScrollButtons();

    return () => {
      container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [checkScrollButtons, isScrolling]);

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
    <section 
      className="py-6 md:py-8 lg:py-10 relative" 
      itemScope 
      itemType="https://schema.org/ItemList"
    >
      {title && (
        <div className="mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
          <h1 
            className="text-2xl md:text-3xl lg:text-4xl font-black mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent" 
            itemProp="name"
          >
            {title}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full" />
          <meta 
            itemProp="description" 
            content={`Lista de ${products.length} promoções de tecnologia verificadas pela comunidade`} 
          />
        </div>
      )}

      {/* Container de scroll horizontal */}
      <div className="relative group">
        {/* Botão esquerdo */}
        {showLeftArrow && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute left-2 sm:left-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full",
              "bg-background/95 backdrop-blur-sm border-2 shadow-lg",
              "hover:bg-background hover:scale-110 transition-all duration-300",
              "hidden sm:flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={() => scroll('left')}
            aria-label="Rolar para esquerda"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        )}

        {/* Container de scroll */}
        <div
          ref={scrollContainerRef}
          className={cn(
            "flex gap-4 md:gap-5 lg:gap-6 overflow-x-auto overflow-y-visible",
            "scroll-smooth",
            "px-4 sm:px-6 lg:px-8",
            "pb-4",
            // Esconder scrollbar mas manter funcionalidade
            "[&::-webkit-scrollbar]:hidden",
            "[-ms-overflow-style:none]",
            "[scrollbar-width:none]"
          )}
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {products.map((product, index) => (
            <div
              key={product.id}
              className={cn(
                "flex-shrink-0 w-[85vw] sm:w-[70vw] md:w-[50vw] lg:w-[40vw] xl:w-[35vw] 2xl:w-[30vw]",
                "scroll-snap-align-start",
                "animate-in fade-in slide-in-from-right-4",
                "transition-all duration-500 ease-out",
                "hover:scale-[1.02] hover:z-10"
              )}
              style={{
                animationDelay: `${Math.min(index * 100, 1000)}ms`,
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

        {/* Botão direito */}
        {showRightArrow && (
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "absolute right-2 sm:right-4 z-20 h-10 w-10 sm:h-12 sm:w-12 rounded-full",
              "bg-background/95 backdrop-blur-sm border-2 shadow-lg",
              "hover:bg-background hover:scale-110 transition-all duration-300",
              "hidden sm:flex items-center justify-center",
              "opacity-0 group-hover:opacity-100 transition-opacity"
            )}
            onClick={() => scroll('right')}
            aria-label="Rolar para direita"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        )}

        {/* Indicador de scroll (gradiente nas bordas) */}
        <div className="absolute left-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-r from-background via-background/80 to-transparent pointer-events-none z-10" />
        <div className="absolute right-0 top-0 bottom-4 w-8 sm:w-12 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* Indicador de scroll (mobile) */}
      <div className="flex justify-center gap-1.5 mt-4 sm:hidden">
        {products.slice(0, Math.min(products.length, 10)).map((_, index) => (
          <div
            key={index}
            className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 transition-all duration-300"
          />
        ))}
      </div>
    </section>
  );
}

