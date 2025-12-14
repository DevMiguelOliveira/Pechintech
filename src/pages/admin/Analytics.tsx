import { useState, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { usePageViewStats, usePageViewsByDay } from '@/hooks/usePageViews';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  MessageCircle,
  Heart,
  Flame,
  Snowflake,
  ExternalLink,
  BarChart3,
  PieChartIcon,
  Activity,
  Calendar,
  Store,
  Users,
  Globe,
} from 'lucide-react';
import { format, subDays, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const GA_ANALYTICS_URL = 'https://analytics.google.com/analytics/web/#/p478028955/reports/intelligenthome';

// Cores para gráficos
const COLORS = ['#f97316', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#eab308'];
const TEMPERATURE_COLORS = {
  hot: '#ef4444',
  warm: '#f97316', 
  neutral: '#eab308',
  cold: '#3b82f6',
};

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  isLoading,
  color = 'primary',
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  isLoading?: boolean;
  color?: 'primary' | 'green' | 'orange' | 'blue' | 'red';
}) => {
  const colorClasses = {
    primary: 'text-primary',
    green: 'text-green-500',
    orange: 'text-orange-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            <div className="flex items-center gap-2 mt-1">
              {trend && trendValue && (
                <Badge
                  variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'secondary'}
                  className="text-[10px] px-1.5 py-0"
                >
                  {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-0.5" /> : <TrendingDown className="h-3 w-3 mr-0.5" />}
                  {trendValue}
                </Badge>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

const Analytics = () => {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: pageViewStats, isLoading: pageViewsLoading } = usePageViewStats();
  const { data: pageViewsByDay } = usePageViewsByDay(7);
  const [period, setPeriod] = useState('7d');

  const isLoading = productsLoading || categoriesLoading;

  // Métricas calculadas
  const metrics = useMemo(() => {
    if (!products) return null;

    const now = new Date();
    const periodDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const periodStart = subDays(now, periodDays);

    // Produtos no período
    const productsInPeriod = products.filter((p) =>
      isAfter(new Date(p.created_at), periodStart)
    );

    // Totais
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.is_active).length;
    const totalHotVotes = products.reduce((sum, p) => sum + p.hot_votes, 0);
    const totalColdVotes = products.reduce((sum, p) => sum + p.cold_votes, 0);
    const totalComments = products.reduce((sum, p) => sum + p.comments_count, 0);
    const avgTemperature = totalProducts
      ? Math.round(products.reduce((sum, p) => sum + p.temperature, 0) / totalProducts)
      : 0;

    // Top produtos por temperatura
    const topByTemperature = [...products]
      .sort((a, b) => b.temperature - a.temperature)
      .slice(0, 5);

    // Top produtos por votos
    const topByVotes = [...products]
      .sort((a, b) => (b.hot_votes + b.cold_votes) - (a.hot_votes + a.cold_votes))
      .slice(0, 5);

    // Top produtos por comentários
    const topByComments = [...products]
      .sort((a, b) => b.comments_count - a.comments_count)
      .slice(0, 5);

    // Distribuição por categoria
    const categoryDistribution = categories?.map((cat) => {
      const categoryProducts = products.filter((p) => p.category_id === cat.id);
      return {
        name: cat.name,
        value: categoryProducts.length,
        votes: categoryProducts.reduce((sum, p) => sum + p.hot_votes + p.cold_votes, 0),
      };
    }).filter((c) => c.value > 0) || [];

    // Distribuição por loja
    const storeMap = new Map<string, { count: number; votes: number }>();
    products.forEach((p) => {
      const current = storeMap.get(p.store) || { count: 0, votes: 0 };
      storeMap.set(p.store, {
        count: current.count + 1,
        votes: current.votes + p.hot_votes + p.cold_votes,
      });
    });
    const storeDistribution = Array.from(storeMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Distribuição de temperatura
    const temperatureDistribution = [
      { name: 'Em Chamas (80-100)', value: products.filter((p) => p.temperature >= 80).length, color: TEMPERATURE_COLORS.hot },
      { name: 'Quente (60-79)', value: products.filter((p) => p.temperature >= 60 && p.temperature < 80).length, color: TEMPERATURE_COLORS.warm },
      { name: 'Morno (40-59)', value: products.filter((p) => p.temperature >= 40 && p.temperature < 60).length, color: TEMPERATURE_COLORS.neutral },
      { name: 'Frio (0-39)', value: products.filter((p) => p.temperature < 40).length, color: TEMPERATURE_COLORS.cold },
    ];

    // Engajamento por dia (últimos 7 dias simulado com base nos produtos)
    const dailyEngagement = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i);
      const dayProducts = products.filter((p) => {
        const createdAt = new Date(p.created_at);
        return format(createdAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
      });
      return {
        date: format(date, 'dd/MM', { locale: ptBR }),
        produtos: dayProducts.length,
        votos: dayProducts.reduce((sum, p) => sum + p.hot_votes + p.cold_votes, 0),
        comentarios: dayProducts.reduce((sum, p) => sum + p.comments_count, 0),
      };
    });

    return {
      totalProducts,
      activeProducts,
      productsInPeriod: productsInPeriod.length,
      totalHotVotes,
      totalColdVotes,
      totalVotes: totalHotVotes + totalColdVotes,
      totalComments,
      avgTemperature,
      topByTemperature,
      topByVotes,
      topByComments,
      categoryDistribution,
      storeDistribution,
      temperatureDistribution,
      dailyEngagement,
    };
  }, [products, categories, period]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Métricas e estatísticas do site
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => window.open(GA_ANALYTICS_URL, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Google Analytics
          </Button>
        </div>
      </div>

      {/* Tráfego do Site */}
      <Card className="border-green-500/20 bg-green-500/5">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5 text-green-500" />
            Tráfego do Site
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            <div className="text-center p-3 rounded-lg bg-background">
              {pageViewsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-green-500">
                  {pageViewStats?.total_views?.toLocaleString('pt-BR') ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Total de Visitas</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              {pageViewsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-blue-500">
                  {pageViewStats?.unique_visitors?.toLocaleString('pt-BR') ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Visitantes Únicos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              {pageViewsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-orange-500">
                  {pageViewStats?.views_today?.toLocaleString('pt-BR') ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Visitas Hoje</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              {pageViewsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-purple-500">
                  {pageViewStats?.views_this_week?.toLocaleString('pt-BR') ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Esta Semana</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-background">
              {pageViewsLoading ? (
                <Skeleton className="h-8 w-16 mx-auto" />
              ) : (
                <p className="text-2xl font-bold text-cyan-500">
                  {pageViewStats?.views_this_month?.toLocaleString('pt-BR') ?? 0}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">Este Mês</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Produtos"
          value={metrics?.totalProducts ?? 0}
          icon={Eye}
          description={`${metrics?.activeProducts ?? 0} ativos`}
          isLoading={isLoading}
        />
        <StatCard
          title="Votos Totais"
          value={metrics?.totalVotes?.toLocaleString('pt-BR') ?? 0}
          icon={Flame}
          description={`${metrics?.totalHotVotes ?? 0} 🔥 | ${metrics?.totalColdVotes ?? 0} ❄️`}
          isLoading={isLoading}
          color="orange"
        />
        <StatCard
          title="Comentários"
          value={metrics?.totalComments?.toLocaleString('pt-BR') ?? 0}
          icon={MessageCircle}
          description="Total de comentários"
          isLoading={isLoading}
          color="blue"
        />
        <StatCard
          title="Temperatura Média"
          value={`${metrics?.avgTemperature ?? 0}°`}
          icon={Activity}
          description="Engajamento geral"
          isLoading={isLoading}
          color={metrics?.avgTemperature && metrics.avgTemperature >= 60 ? 'orange' : 'blue'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Engajamento Diário */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Engajamento por Dia
            </CardTitle>
            <CardDescription>
              Produtos, votos e comentários nos últimos 7 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.dailyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="votos"
                    stackId="1"
                    stroke="#f97316"
                    fill="#f97316"
                    fillOpacity={0.6}
                    name="Votos"
                  />
                  <Area
                    type="monotone"
                    dataKey="comentarios"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="Comentários"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Produtos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : metrics?.categoryDistribution.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhuma categoria com produtos
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics?.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                    labelLine={false}
                  >
                    {metrics?.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Distribuição por Temperatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Distribuição de Temperatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics?.temperatureDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" name="Produtos">
                    {metrics?.temperatureDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top por Temperatura */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-orange-500" />
              Mais Quentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              metrics?.topByTemperature.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.store}</p>
                  </div>
                  <Badge variant="secondary" className="text-orange-500">
                    {product.temperature}°
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top por Votos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Heart className="h-4 w-4 text-red-500" />
              Mais Votados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              metrics?.topByVotes.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      🔥 {product.hot_votes} | ❄️ {product.cold_votes}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {product.hot_votes + product.cold_votes}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top por Comentários */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              Mais Comentados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              [...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : (
              metrics?.topByComments.map((product, index) => (
                <div key={product.id} className="flex items-center gap-3">
                  <span className="text-sm font-bold text-muted-foreground w-4">
                    {index + 1}
                  </span>
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.title}</p>
                    <p className="text-xs text-muted-foreground">{product.store}</p>
                  </div>
                  <Badge variant="secondary" className="text-blue-500">
                    {product.comments_count}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lojas Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Produtos por Loja
          </CardTitle>
          <CardDescription>
            Distribuição de produtos e engajamento por loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={metrics?.storeDistribution}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="#f97316" name="Produtos" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Google Analytics Info */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Google Analytics Integrado
          </CardTitle>
          <CardDescription>
            O site está conectado ao Google Analytics 4 (G-WRJVV4M71N).
            Acesse o painel completo para ver métricas detalhadas de tráfego.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => window.open(GA_ANALYTICS_URL, '_blank')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Google Analytics
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://analytics.google.com/analytics/web/#/p478028955/reports/explorer?params=_u..nav%3Dmaui%26_r.explorerCard..startRow%3D0&r=events-overview', '_blank')}
            >
              Ver Eventos
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://analytics.google.com/analytics/web/#/p478028955/reports/reportinghub', '_blank')}
            >
              Relatórios
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground text-xs">Eventos Rastreados</p>
              <p className="font-semibold mt-1">12 tipos</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground text-xs">Page Views</p>
              <p className="font-semibold mt-1">Automático</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground text-xs">Conversões</p>
              <p className="font-semibold mt-1">promo_click</p>
            </div>
            <div className="p-3 rounded-lg bg-background">
              <p className="text-muted-foreground text-xs">Status</p>
              <p className="font-semibold mt-1 text-green-500">● Ativo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;

