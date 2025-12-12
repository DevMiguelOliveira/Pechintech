import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, FolderTree, TrendingUp, Eye } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SEO } from '@/components/SEO';

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  isLoading?: boolean;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-20" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const activeProducts = products?.filter((p) => p.is_active).length ?? 0;
  const totalProducts = products?.length ?? 0;
  const inactiveProducts = totalProducts - activeProducts;
  const avgTemperature = activeProducts > 0
    ? Math.round(
        products
          ?.filter((p) => p.is_active)
          .reduce((sum, p) => sum + p.temperature, 0) / activeProducts || 0
      )
    : 0;
  
  // Estatísticas de produtos ativos
  const totalVotes = products
    ?.filter((p) => p.is_active)
    .reduce((sum, p) => sum + p.hot_votes + p.cold_votes, 0) ?? 0;
  
  const totalComments = products
    ?.filter((p) => p.is_active)
    .reduce((sum, p) => sum + p.comments_count, 0) ?? 0;

  return (
    <div className="space-y-6">
      <SEO
        title="Painel Administrativo - Dashboard"
        description="Painel administrativo do PechinTech - Gerencie produtos, categorias e visualize estatísticas"
        url="/admin"
        noindex
      />
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do seu painel administrativo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={totalProducts}
          icon={Package}
          description={`${activeProducts} ativos`}
          isLoading={productsLoading}
        />
        <StatCard
          title="Categorias"
          value={categories?.length ?? 0}
          icon={FolderTree}
          description={`${categories?.length ?? 0} ${(categories?.length ?? 0) === 1 ? 'categoria' : 'categorias'}`}
          isLoading={categoriesLoading}
        />
        <StatCard
          title="Temperatura Média"
          value={`${avgTemperature}°`}
          icon={TrendingUp}
          description="Engajamento geral"
          isLoading={productsLoading}
        />
        <StatCard
          title="Produtos Ativos"
          value={activeProducts}
          icon={Eye}
          description={`${inactiveProducts} ${inactiveProducts === 1 ? 'inativo' : 'inativos'}`}
          isLoading={productsLoading}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Votos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVotes.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground mt-1">Em produtos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Comentários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComments.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-muted-foreground mt-1">Em produtos ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Ativação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalProducts > 0 
                ? Math.round((activeProducts / totalProducts) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">Produtos ativos vs total</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum produto cadastrado ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {products?.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-12 h-12 rounded-lg object-contain bg-muted/50 p-1 shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                      target.className = 'w-12 h-12 rounded-lg object-contain bg-muted/50 p-1 shrink-0 opacity-50';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {product.current_price.toFixed(2)}
                    </p>
                  </div>
                  <div
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      product.is_active
                        ? 'bg-green-500/20 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {product.is_active ? 'Ativo' : 'Inativo'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
