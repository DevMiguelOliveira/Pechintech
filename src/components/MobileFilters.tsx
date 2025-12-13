import { useState } from 'react';
import { Filter, Flame, Clock, MessageCircle, ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useCategories, DbCategory } from '@/hooks/useCategories';
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

// Organiza categorias em hierarquia
function organizeCategoriesHierarchy(categories: DbCategory[]) {
  const rootCategories = categories.filter((cat) => !cat.parent_id);
  const subcategoriesMap = new Map<string, DbCategory[]>();

  categories.forEach((cat) => {
    if (cat.parent_id) {
      if (!subcategoriesMap.has(cat.parent_id)) {
        subcategoriesMap.set(cat.parent_id, []);
      }
      subcategoriesMap.get(cat.parent_id)!.push(cat);
    }
  });

  return { rootCategories, subcategoriesMap };
}

export function MobileFilters({
  selectedCategory,
  onSelectCategory,
  selectedSort,
  onSelectSort,
}: MobileFiltersProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleGoHome = () => {
    onSelectCategory(null);
    onSelectSort('hottest');
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const { rootCategories, subcategoriesMap } = organizeCategoriesHierarchy(
    categories || []
  );

  const activeFiltersCount = (selectedCategory ? 1 : 0) + (selectedSort !== 'hottest' ? 1 : 0);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="lg:hidden sticky top-16 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-3">
      <div className="container">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {/* Home Button */}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={handleGoHome}
          >
            <Home className="h-4 w-4 mr-1" />
            Início
          </Button>

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
                  <div className="space-y-2">
                    <Button
                      variant={selectedCategory === null ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        onSelectCategory(null);
                        setIsOpen(false);
                      }}
                      aria-pressed={selectedCategory === null}
                      aria-label="Mostrar todas as categorias"
                      className="w-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                      Todas as categorias
                    </Button>
                    {categoriesLoading ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-8 w-full" />
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {rootCategories.map((category) => {
                          const isSelected = selectedCategory === category.slug;
                          const hasSubcategories = subcategoriesMap.has(category.id);
                          const isExpanded = expandedCategories.has(category.id);
                          const subcategories = subcategoriesMap.get(category.id) || [];

                          return (
                            <div key={category.id} className="space-y-1">
                              <div className="flex items-center gap-2">
                                {hasSubcategories && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 p-0"
                                    onClick={() => toggleCategory(category.id)}
                                    aria-label={isExpanded ? 'Recolher' : 'Expandir'}
                                  >
                                    <ChevronRight
                                      className={cn(
                                        'h-3 w-3 transition-transform',
                                        isExpanded && 'rotate-90'
                                      )}
                                      aria-hidden="true"
                                    />
                                  </Button>
                                )}
                                <Button
                                  variant={isSelected ? 'default' : 'outline'}
                                  size="sm"
                                  className={cn(
                                    'flex-1 justify-start',
                                    'focus:ring-2 focus:ring-primary focus:ring-offset-2',
                                    !hasSubcategories && 'ml-9'
                                  )}
                                  onClick={() => {
                                    onSelectCategory(category.slug as Category);
                                  }}
                                  aria-pressed={isSelected}
                                  aria-label={`Filtrar por ${category.name}`}
                                >
                                  {category.name}
                                </Button>
                              </div>
                              {hasSubcategories && isExpanded && (
                                <div className="ml-9 space-y-1">
                                  {subcategories.map((subcategory) => {
                                    const isSubSelected = selectedCategory === subcategory.slug;
                                    return (
                                      <Button
                                        key={subcategory.id}
                                        variant={isSubSelected ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                          'w-full justify-start text-sm',
                                          'focus:ring-2 focus:ring-primary focus:ring-offset-2'
                                        )}
                                        onClick={() => {
                                          onSelectCategory(subcategory.slug as Category);
                                        }}
                                        aria-pressed={isSubSelected}
                                        aria-label={`Filtrar por ${subcategory.name}`}
                                      >
                                        <span className="text-muted-foreground mr-2">└─</span>
                                        {subcategory.name}
                                      </Button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Quick Category Pills - Apenas categorias raiz */}
          {!categoriesLoading &&
            rootCategories.slice(0, 4).map((category) => {
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
                  <span className="truncate max-w-[100px]">{category.name}</span>
                </Button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
