import { useState } from 'react';
import { Filter, Flame, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

interface MobileFiltersProps {
  selectedCategory: Category | null;
  onSelectCategory: (category: Category | null) => void;
  selectedSort: SortOption;
  onSelectSort: (sort: SortOption) => void;
}

export function MobileFilters({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
}: MobileFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedSort !== 'hottest' ? 1 : 0);

  return (
    <div className="lg:hidden sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-3">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {/* Filter Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="shrink-0 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label={`Abrir filtros${activeFiltersCount > 0 ? `. ${activeFiltersCount} filtro${activeFiltersCount !== 1 ? 's' : ''} ativo${activeFiltersCount !== 1 ? 's' : ''}` : ''}`}
              >
                <Filter className="h-4 w-4 mr-2" aria-hidden="true" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground" aria-hidden="true">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[70vh] rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {/* Sort Options */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Ordenar por
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {sortOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <Button
                          key={option.id}
                          variant={selectedSort === option.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            onSelectSort(option.id);
                            setIsOpen(false);
                          }}
                          aria-pressed={selectedSort === option.id}
                          aria-label={`Ordenar por ${option.name}`}
                          className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                          <Icon className="h-4 w-4 mr-2" aria-hidden="true" />
                          {option.name}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <Separator />

                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Categorias
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        onSelectCategory(null);
                        setIsOpen(false);
                      }}
                      aria-pressed={selectedCategory === null}
                      aria-label="Mostrar todas as categorias"
                      className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Todas
                    </Button>
                    {categoriesLoading ? (
                      <>
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-20" />
                        ))}
                      </>
                    ) : (
                      categories?.map((category) => {
                        const Icon = getCategoryIcon(category.icon);
                        const isSelected = selectedCategory === category.slug;
                        return (
                          <Button
                            key={category.id}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              onSelectCategory(category.slug as Category);
                              setIsOpen(false);
                            }}
                            aria-pressed={isSelected}
                            aria-label={`Filtrar por ${category.name}`}
                            className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
                          >
                            <Icon className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
                            {category.name}
                          </Button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick Category Pills */}
          {!categoriesLoading &&
            categories?.slice(0, 4).map((category) => {
              const Icon = getCategoryIcon(category.icon);
              const isSelected = selectedCategory === category.slug;
              return (
                <Button
                  key={category.id}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  className="shrink-0"
                  onClick={() =>
                    onSelectCategory(
                      isSelected ? null : (category.slug as Category)
                    )
                  }
                  aria-pressed={isSelected}
                  aria-label={`Filtrar por ${category.name}`}
                >
                  <Icon className="h-4 w-4 mr-1 shrink-0" aria-hidden="true" />
                  <span className="truncate max-w-[100px]">{category.name}</span>
                </Button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
