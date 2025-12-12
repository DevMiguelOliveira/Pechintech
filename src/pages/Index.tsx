import { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MobileFilters } from '@/components/MobileFilters';
import { FavoritesDrawer } from '@/components/FavoritesDrawer';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { Product, Comment, Category, SortOption } from '@/types';
import { toast } from '@/hooks/use-toast';

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
  const { data: dbProducts, isLoading } = useActiveProducts();
  const products = useMemo(() => dbProducts?.map(mapDbProductToProduct) || [], [dbProducts]);

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('hottest');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Mock comments
  const [comments] = useState<Comment[]>([
    {
      id: '1',
      product_id: '1',
      user_id: '1',
      content: 'Ótimo preço! Comprei na promoção passada e chegou super rápido.',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      profile: { id: '1', username: 'gamer_br', avatar_url: null, created_at: '' },
    },
    {
      id: '2',
      product_id: '1',
      user_id: '2',
      content: 'Vale muito a pena! O desempenho é incrível para jogos.',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      profile: { id: '2', username: 'tech_lover', avatar_url: null, created_at: '' },
    },
  ]);

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

    // Category filter
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
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
        toast({
          title: 'Removido dos favoritos',
          description: 'A promoção foi removida da sua lista.',
        });
      } else {
        newFavorites.add(productId);
        toast({
          title: 'Adicionado aos favoritos',
          description: 'A promoção foi salva na sua lista!',
        });
      }
      return newFavorites;
    });
  };

  const handleVoteHot = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              hot_votes: p.hot_votes + 1,
              temperature: Math.min(100, p.temperature + 2),
            }
          : p
      )
    );
    toast({
      title: '🔥 Voto quente!',
      description: 'Você esquentou essa promoção!',
    });
  };

  const handleVoteCold = (productId: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? {
              ...p,
              cold_votes: p.cold_votes + 1,
              temperature: Math.max(0, p.temperature - 2),
            }
          : p
      )
    );
    toast({
      title: '❄️ Voto frio!',
      description: 'Você esfriou essa promoção.',
    });
  };

  const handleAddComment = (content: string) => {
    toast({
      title: 'Comentário adicionado!',
      description: 'Seu comentário foi publicado.',
    });
  };

  // Get comments for selected product
  const productComments = selectedProduct
    ? comments.filter((c) => c.product_id === selectedProduct.id)
    : [];

  return (
    <div className="min-h-screen bg-background">
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
            {/* Hero Section */}
            {!searchQuery && !selectedCategory && (
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
          </div>
        </main>
      </div>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onVoteHot={(id) => toast({ title: 'Faça login para votar' })}
        onVoteCold={(id) => toast({ title: 'Faça login para votar' })}
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
