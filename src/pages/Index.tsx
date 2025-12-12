import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MobileFilters } from '@/components/MobileFilters';
import { FavoritesDrawer } from '@/components/FavoritesDrawer';
import { SEO } from '@/components/SEO';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVotes';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { useComments, useAddComment } from '@/hooks/useComments';
import { Product, Category, SortOption } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

// Transform DB product to UI product
const mapDbProductToProduct = (p: DbProduct): Product => ({
  id: p.id,
  title: p.title,
  description: p.description,
  image_url: p.image_url,
  current_price: Number(p.current_price),
  original_price: Number(p.original_price),
  affiliate_url: p.affiliate_url,
  category: p.categories?.slug || 'hardware',
  temperature: p.temperature,
  hot_votes: p.hot_votes,
  cold_votes: p.cold_votes,
  comments_count: p.comments_count,
  store: p.store,
  created_at: p.created_at,
  specs: p.specs,
});

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbProducts, isLoading } = useActiveProducts();
  const products = useMemo(() => dbProducts?.map(mapDbProductToProduct) || [], [dbProducts]);

  // Favorites
  const { data: favoritesSet } = useFavorites();
  const favorites = favoritesSet || new Set<string>();
  const toggleFavorite = useToggleFavorite();

  // Votes
  const vote = useVote();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('hottest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Comments for selected product
  const { data: productComments = [] } = useComments(selectedProduct?.id);
  const addComment = useAddComment();

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    // Category filter (usa slug da categoria)
    if (selectedCategory) {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (selectedSort) {
      case 'hottest':
        result.sort((a, b) => b.temperature - a.temperature);
        break;
      case 'newest':
        result.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'commented':
        result.sort((a, b) => b.comments_count - a.comments_count);
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedSort]);

  // Trending products (top 4 by temperature)
  const trendingProducts = useMemo(() => {
    return [...products].sort((a, b) => b.temperature - a.temperature).slice(0, 4);
  }, [products]);

  // Favorite products
  const favoriteProducts = useMemo(() => {
    return products.filter((p) => favorites.has(p.id));
  }, [products, favorites]);

  // Handlers
  const handleToggleFavorite = (productId: string) => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Entre na sua conta para salvar favoritos.',
      });
      navigate('/auth');
      return;
    }
    toggleFavorite.mutate(productId);
  };

  const handleVoteHot = (productId: string) => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Entre na sua conta para votar.',
      });
      navigate('/auth');
      return;
    }
    vote.mutate({ productId, voteType: 'hot' });
  };

  const handleVoteCold = (productId: string) => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Entre na sua conta para votar.',
      });
      navigate('/auth');
      return;
    }
    vote.mutate({ productId, voteType: 'cold' });
  };

  const handleAddComment = (content: string) => {
    if (!user) {
      toast({
        title: 'Faça login',
        description: 'Entre na sua conta para comentar.',
      });
      navigate('/auth');
      return;
    }
    if (!selectedProduct) return;
    addComment.mutate({ productId: selectedProduct.id, content });
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Promoções de Tecnologia"
        description="Encontre as melhores promoções de tecnologia. Hardware, periféricos, games e smartphones com os menores preços. Vote nas ofertas e compartilhe com a comunidade!"
        url="/"
      />
      
      {/* Header */}
      <Header
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        favoritesCount={favorites.size}
      />

      {/* Mobile Filters */}
      <MobileFilters
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        selectedSort={selectedSort}
        onSelectSort={setSelectedSort}
      />

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar - Desktop */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSort={selectedSort}
          onSelectSort={setSelectedSort}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="container py-4 lg:py-6">
            {isLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-80 w-full rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {/* Hero Section */}
                {!searchQuery && !selectedCategory && trendingProducts.length > 0 && (
                  <HeroSection
                    trendingProducts={trendingProducts}
                    onOpenDetails={setSelectedProduct}
                    onToggleFavorite={handleToggleFavorite}
                    onVoteHot={handleVoteHot}
                    onVoteCold={handleVoteCold}
                    favorites={favorites}
                  />
                )}

                {/* Product Grid */}
                <ProductGrid
                  products={filteredProducts}
                  onOpenDetails={setSelectedProduct}
                  onToggleFavorite={handleToggleFavorite}
                  onVoteHot={handleVoteHot}
                  onVoteCold={handleVoteCold}
                  favorites={favorites}
                  title={
                    selectedCategory
                      ? `Promoções de ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`
                      : searchQuery
                      ? `Resultados para "${searchQuery}"`
                      : 'Todas as Promoções'
                  }
                />

                {filteredProducts.length === 0 && !isLoading && (
                  <div className="text-center py-16">
                    <p className="text-muted-foreground text-lg">
                      {searchQuery || selectedCategory 
                        ? 'Nenhum produto encontrado com esses filtros.'
                        : 'Nenhum produto cadastrado ainda. Acesse o painel admin para adicionar.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onVoteHot={handleVoteHot}
        onVoteCold={handleVoteCold}
        comments={productComments}
        onAddComment={handleAddComment}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteProducts}
        onRemoveFavorite={handleToggleFavorite}
        onOpenDetails={setSelectedProduct}
      />
    </div>
  );
};

export default Index;
