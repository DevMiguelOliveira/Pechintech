import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { BannerGrupos } from '@/components/BannerGrupos';
import { ProductGrid } from '@/components/ProductGrid';
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { MobileFilters } from '@/components/MobileFilters';
import { FavoritesDrawer } from '@/components/FavoritesDrawer';
import { LeadCapture } from '@/components/LeadCapture';
import { WhatsAppCTA } from '@/components/WhatsAppCTA';
import { FAQSection } from '@/components/FAQSection';
import { SEO } from '@/components/SEO';
import { useActiveProducts, DbProduct } from '@/hooks/useProducts';
import { useAuth } from '@/hooks/useAuth';
import { useVote } from '@/hooks/useVotes';
import { useFavorites, useToggleFavorite } from '@/hooks/useFavorites';
import { useComments, useAddComment, useDeleteComment } from '@/hooks/useComments';
import { useTrackPageView } from '@/hooks/usePageViews';
import { useCategories, DbCategory } from '@/hooks/useCategories';
import { Product, Category, SortOption } from '@/types';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { trackSearch, trackCategoryFilter } from '@/services/analytics';

// Transform DB product to UI product
const mapDbProductToProduct = (p: DbProduct): Product => {
  // Garantir que sempre temos um slug de categoria válido
  const categorySlug = p.categories?.slug?.toLowerCase().trim() || 'hardware';
  
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    image_url: p.image_url,
    current_price: Number(p.current_price),
    original_price: Number(p.original_price),
    affiliate_url: p.affiliate_url,
    category: categorySlug as Category,
    temperature: p.temperature,
    hot_votes: p.hot_votes,
    cold_votes: p.cold_votes,
    comments_count: p.comments_count,
    store: p.store,
    created_at: p.created_at,
    specs: p.specs,
    coupon_code: p.coupon_code,
  };
};

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: dbProducts, isLoading } = useActiveProducts();
  const { data: categories } = useCategories();
  
  // Rastrear visita na página
  useTrackPageView('/');
  
  const products = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map((p) => mapDbProductToProduct(p));
  }, [dbProducts]);

  // Criar mapa de hierarquia de categorias para filtro inteligente
  const categoryHierarchy = useMemo(() => {
    if (!categories) return { rootToSubcategories: new Map<string, Set<string>>(), allSlugs: new Set<string>() };
    
    const rootToSubcategories = new Map<string, Set<string>>();
    const allSlugs = new Set<string>();
    
    // Criar mapa de categorias por slug
    const categoriesBySlug = new Map<string, DbCategory>();
    categories.forEach(cat => {
      categoriesBySlug.set(cat.slug, cat);
      allSlugs.add(cat.slug);
    });
    
    // Para cada categoria raiz, encontrar todas as subcategorias
    categories.forEach(cat => {
      if (!cat.parent_id) {
        // É uma categoria raiz
        const subcategorySlugs = new Set<string>([cat.slug]); // Inclui a própria categoria raiz
        
        // Encontrar todas as subcategorias diretas e indiretas
        const findSubcategories = (parentId: string) => {
          categories.forEach(subcat => {
            if (subcat.parent_id === parentId) {
              subcategorySlugs.add(subcat.slug);
              // Recursivamente encontrar subcategorias desta subcategoria
              findSubcategories(subcat.id);
            }
          });
        };
        
        findSubcategories(cat.id);
        rootToSubcategories.set(cat.slug, subcategorySlugs);
      }
    });
    
    return { rootToSubcategories, allSlugs };
  }, [categories]);

  // Favorites
  const { data: favoritesSet } = useFavorites();
  const favorites = favoritesSet || new Set<string>();
  const toggleFavorite = useToggleFavorite();

  // Votes
  const vote = useVote();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('newest'); // Padrão: mais recentes primeiro
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);

  // Comments for selected product
  const { data: productComments = [] } = useComments(selectedProduct?.id);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();

  // Ref para debounce de busca no analytics
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const prevCategoryRef = useRef<Category | null>(null);

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
    // Se for categoria raiz, inclui produtos da categoria e todas as subcategorias
    if (selectedCategory) {
      const selectedCategorySlug = selectedCategory.toLowerCase().trim();
      
      // Verificar se é uma categoria raiz (tem subcategorias)
      const rootSubcategories = categoryHierarchy.rootToSubcategories.get(selectedCategorySlug);
      
      if (rootSubcategories && rootSubcategories.size > 1) {
        // É uma categoria raiz - incluir produtos da categoria e todas as subcategorias
        result = result.filter((p) => {
          const productCategorySlug = p.category?.toLowerCase().trim();
          return rootSubcategories.has(productCategorySlug || '');
        });
      } else {
        // É uma subcategoria ou categoria sem subcategorias - filtrar apenas essa categoria
        result = result.filter((p) => {
          const productCategorySlug = p.category?.toLowerCase().trim();
          return productCategorySlug === selectedCategorySlug;
        });
      }
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
  }, [products, searchQuery, selectedCategory, selectedSort, categoryHierarchy]);

  // Analytics: tracking de busca (com debounce de 1 segundo)
  useEffect(() => {
    if (searchQuery.trim()) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      searchTimeoutRef.current = setTimeout(() => {
        trackSearch(searchQuery, filteredProducts.length);
      }, 1000);
    }
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredProducts.length]);

  // Analytics: tracking de filtro por categoria
  useEffect(() => {
    if (selectedCategory && selectedCategory !== prevCategoryRef.current) {
      trackCategoryFilter(selectedCategory);
    }
    prevCategoryRef.current = selectedCategory;
  }, [selectedCategory]);

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

  const handleDeleteComment = (commentId: string) => {
    if (!selectedProduct) return;
    deleteComment.mutate({ commentId, productId: selectedProduct.id });
  };

  // FAQ Data for SEO
  const faqData = [
    {
      question: 'Como funciona o PechinTech?',
      answer: 'O PechinTech é uma plataforma colaborativa onde a comunidade encontra e avalia as melhores promoções de tecnologia. Você pode votar se uma oferta é "quente" (boa) ou "fria" (ruim), comentar e compartilhar com amigos.',
    },
    {
      question: 'Os links são seguros?',
      answer: 'Sim! Todos os links são verificados e direcionam para lojas parceiras confiáveis. Utilizamos links afiliados, o que significa que ganhamos uma pequena comissão quando você compra, sem custo adicional para você.',
    },
    {
      question: 'Como posso receber promoções exclusivas?',
      answer: 'Cadastre seu email no banner acima ou fale conosco no WhatsApp para receber as melhores ofertas em primeira mão, antes mesmo de serem publicadas no site.',
    },
    {
      question: 'Os cupons de desconto são válidos?',
      answer: 'Sim! Todos os cupons são testados antes de serem publicados. Se encontrar algum cupom que não funciona, avise nos comentários para que possamos atualizar.',
    },
    {
      question: 'Vale a pena comprar produtos em promoção?',
      answer: 'Depende! Analisamos cada produto considerando preço, qualidade e necessidade. Nossa comunidade avalia cada oferta para te ajudar a tomar a melhor decisão. Sempre compare preços e leia as especificações antes de comprar.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="PechinTech | Promoções de Tecnologia - Melhores Ofertas e Descontos"
        description={`Encontre as melhores promoções de tecnologia no Brasil! ${products.length > 0 ? `${products.length} ofertas verificadas` : 'Ofertas'} de hardware, games, smartphones e periféricos com os menores preços. Cupons exclusivos e avaliações da comunidade. Compare preços e economize agora!`}
        keywords="promoções tecnologia, ofertas hardware, descontos games, promoções smartphones, notebooks baratos, placa de vídeo promoção, processador barato, memória RAM oferta, SSD promoção, monitor gamer, teclado mecânico, mouse gamer, headset promoção, PC gamer barato, pechinchas tecnologia, cupom desconto tecnologia, onde comprar tecnologia barato, melhor custo benefício tecnologia"
        url="/"
        faqData={faqData}
        structuredData={products.length > 0 ? {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': 'https://www.pechintech.com.br',
          name: 'PechinTech | Site Oficial - Promoções de Tecnologia',
          description: 'PechinTech é o site oficial de promoções de tecnologia do Brasil. Encontre as melhores ofertas de hardware, games, smartphones e periféricos.',
          url: 'https://www.pechintech.com.br',
          mainEntity: {
            '@type': 'ItemList',
            name: 'Promoções de Tecnologia',
            description: 'Lista de produtos em promoção',
            numberOfItems: products.length,
            itemListElement: products.slice(0, 10).map((product, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'Product',
                name: product.title,
                description: product.description.substring(0, 160),
                image: product.image_url,
                category: product.category,
                offers: {
                  '@type': 'Offer',
                  price: product.current_price,
                  priceCurrency: 'BRL',
                  availability: 'https://schema.org/InStock',
                  url: product.affiliate_url,
                  priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  seller: {
                    '@type': 'Organization',
                    name: product.store || 'Loja Parceira',
                  },
                },
                aggregateRating: product.hot_votes + product.cold_votes > 0 ? {
                  '@type': 'AggregateRating',
                  ratingValue: ((product.hot_votes / (product.hot_votes + product.cold_votes)) * 5).toFixed(1),
                  reviewCount: product.hot_votes + product.cold_votes,
                  bestRating: '5',
                  worstRating: '1',
                } : undefined,
              },
            })),
          },
        } : undefined}
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
        <main className="flex-1 min-w-0 lg:ml-64">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 lg:py-6">
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
                {/* Lead Capture Banner */}
                {!searchQuery && !selectedCategory && (
                  <LeadCapture variant="banner" />
                )}

                {/* Banner Grupos */}
                {!searchQuery && !selectedCategory && trendingProducts.length > 0 && (
                  <BannerGrupos />
                )}

                {/* Hero Section - Trending Products */}
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
                      : 'As ofertas mais votadas pela comunidade'
                  }
                />

                {filteredProducts.length === 0 && !isLoading && (
                  <div className="text-center py-16 space-y-6">
                    <p className="text-muted-foreground text-lg">
                      {searchQuery || selectedCategory 
                        ? 'Nenhum produto encontrado com esses filtros.'
                        : 'Nenhum produto cadastrado ainda. Acesse o painel admin para adicionar.'}
                    </p>
                    {!searchQuery && !selectedCategory && (
                      <LeadCapture variant="inline" />
                    )}
                  </div>
                )}

                {/* Lead Capture Section - After Products */}
                {filteredProducts.length > 0 && !searchQuery && !selectedCategory && (
                  <div className="mt-8">
                    <LeadCapture variant="inline" />
                  </div>
                )}

                {/* FAQ Section - SEO Content */}
                {!searchQuery && !selectedCategory && (
                  <div className="mt-12">
                    <FAQSection faqs={faqData} />
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
        onDeleteComment={handleDeleteComment}
      />

      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favoriteProducts}
        onRemoveFavorite={handleToggleFavorite}
        onOpenDetails={setSelectedProduct}
      />

      {/* WhatsApp Floating CTA */}
      <WhatsAppCTA variant="floating" />
    </div>
  );
};

export default Index;
