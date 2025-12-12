import { Cpu, Flame, Clock, MessageCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Category, SortOption } from '@/types';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { getCategoryIcon } from '@/lib/categoryIcons';
import { Skeleton } from '@/components/ui/skeleton';

const sortOptions = [
  { id: 'hottest', name: 'Mais Quentes', icon: Flame },
  { id: 'newest', name: 'Mais Recentes', icon: Clock },
  { id: 'commented', name: 'Mais Comentados', icon: MessageCircle },
] as const;

interface SidebarProps {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
  className?: string;
}

export function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
  className,
}: SidebarProps) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <aside
      className={cn(
        'w-64 shrink-0 border-r border-border/50 bg-sidebar hidden lg:block',
        className
      )}
    >
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-6">
          {/* Sort Section */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
              <Filter className="h-4 w-4" />
              Ordenar por
            </h3>
            <div className="space-y-1">
              {sortOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.id}
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 font-normal',
                      'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                      selectedSort === option.id && 'bg-primary/10 text-primary'
                    )}
                    onClick={() => onSelectSort(option.id)}
                    aria-pressed={selectedSort === option.id}
                    aria-label={`Ordenar por ${option.name}`}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4',
                        selectedSort === option.id && 'text-primary'
                      )}
                      aria-hidden="true"
                    />
                    {option.name}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Categories Section */}
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
              <Cpu className="h-4 w-4" />
              Categorias
            </h3>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3 font-normal',
                  'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  selectedCategory === null && 'bg-primary/10 text-primary'
                )}
                onClick={() => onSelectCategory(null)}
                aria-pressed={selectedCategory === null}
                aria-label="Filtrar todas as categorias"
              >
                Todas as categorias
              </Button>
              {categoriesLoading ? (
                <div className="space-y-1">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : (
                categories?.map((category) => {
                  const Icon = getCategoryIcon(category.icon);
                  const isSelected = selectedCategory === category.slug;
                  return (
                    <Button
                      key={category.id}
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 font-normal',
                        'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                        isSelected && 'bg-primary/10 text-primary'
                      )}
                      onClick={() => onSelectCategory(category.slug as Category)}
                      aria-pressed={isSelected}
                      aria-label={`Filtrar por categoria ${category.name}`}
                    >
                      <Icon
                        className={cn(
                          'h-4 w-4 shrink-0',
                          isSelected && 'text-primary'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate">{category.name}</span>
                    </Button>
                  );
                })
              )}
            </div>
          </div>

          <Separator className="bg-border/50" />

          {/* Stats */}
          <div className="rounded-lg bg-surface-elevated p-4 space-y-3">
            <h4 className="text-sm font-semibold">Estatísticas do Dia</h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-md bg-background p-2">
                <div className="text-lg font-bold text-primary">127</div>
                <div className="text-[10px] text-muted-foreground">Promoções</div>
              </div>
              <div className="rounded-md bg-background p-2">
                <div className="text-lg font-bold text-cyber-blue">2.4K</div>
                <div className="text-[10px] text-muted-foreground">Votos</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
