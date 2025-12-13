import { useState } from 'react';
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  DbCategory,
  CategoryFormData,
} from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
} from 'lucide-react';

const emptyForm: CategoryFormData = {
  name: '',
  slug: '',
  parent_id: null,
};

const CategoryForm = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  categories,
}: {
  initialData: CategoryFormData;
  onSubmit: (data: CategoryFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
  categories?: DbCategory[];
}) => {
  const [form, setForm] = useState(initialData);

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setForm({ ...form, name, slug });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
      <div className="space-y-0.5 sm:space-y-1">
        <Label htmlFor="name" className="text-[10px] sm:text-xs">Nome *</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          required
          className="h-7 sm:h-8 text-[11px] sm:text-xs"
        />
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <Label htmlFor="slug" className="text-[10px] sm:text-xs">Slug (URL)</Label>
        <Input
          id="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
          className="h-7 sm:h-8 text-[11px] sm:text-xs font-mono"
        />
      </div>

      <div className="space-y-0.5 sm:space-y-1">
        <Label htmlFor="parent_id" className="text-[10px] sm:text-xs">Categoria Pai</Label>
        <Select 
          value={form.parent_id || '__none__'} 
          onValueChange={(value) => setForm({ ...form, parent_id: value === '__none__' ? null : value })}
        >
          <SelectTrigger className="h-7 sm:h-8 text-[11px] sm:text-xs">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Nenhuma (raiz)</SelectItem>
            {categories?.filter((cat) => !cat.parent_id).map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
          Opcional - selecione para criar subcategoria.
        </p>
      </div>

      <div className="flex gap-2 pt-2 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onCancel} size="sm" className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} size="sm" className="flex-1 h-7 sm:h-8 text-[10px] sm:text-xs">
          {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
};

const Categories = () => {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<DbCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<DbCategory | null>(null);

  const handleCreate = (data: CategoryFormData) => {
    createCategory.mutate(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const handleUpdate = (data: CategoryFormData) => {
    if (!editingCategory) return;
    updateCategory.mutate(
      { id: editingCategory.id, ...data },
      { onSuccess: () => setEditingCategory(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteCategory.mutate(deletingCategory.id, {
      onSuccess: () => setDeletingCategory(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as categorias de produtos
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 text-xs sm:text-sm">
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[94vw] max-w-[320px] sm:max-w-sm p-3 sm:p-4 max-h-[85vh] flex flex-col" aria-describedby="create-category-description">
            <DialogHeader className="pb-1 sm:pb-2 shrink-0">
              <DialogTitle className="text-sm sm:text-base">Nova Categoria</DialogTitle>
              <DialogDescription id="create-category-description" className="text-[10px] sm:text-xs">
                Preencha os campos para criar uma nova categoria.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-1">
              <CategoryForm
                initialData={emptyForm}
                onSubmit={handleCreate}
                isLoading={createCategory.isPending}
                onCancel={() => setIsCreateOpen(false)}
                categories={categories}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : categories?.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Nenhuma categoria encontrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="hidden sm:table-cell">Slug</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria Pai</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories?.map((category) => {
                    return (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.parent_id ? (
                            <span className="text-muted-foreground">└─ {category.name}</span>
                          ) : (
                            category.name
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {category.slug}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {category.parent?.name || '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setEditingCategory(category)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingCategory(category)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="w-[94vw] max-w-[320px] sm:max-w-sm p-3 sm:p-4 max-h-[85vh] flex flex-col" aria-describedby="edit-category-description">
          <DialogHeader className="pb-1 sm:pb-2 shrink-0">
            <DialogTitle className="text-sm sm:text-base">Editar Categoria</DialogTitle>
            <DialogDescription id="edit-category-description" className="text-[10px] sm:text-xs">
              Altere os campos para atualizar a categoria.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-1">
            {editingCategory && (
              <CategoryForm
                initialData={{
                  name: editingCategory.name,
                  slug: editingCategory.slug,
                  parent_id: editingCategory.parent_id,
                }}
                onSubmit={handleUpdate}
                isLoading={updateCategory.isPending}
                onCancel={() => setEditingCategory(null)}
                categories={categories?.filter((cat) => cat.id !== editingCategory.id)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A categoria "{deletingCategory?.name}" será
              removida. Produtos vinculados ficarão sem categoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Categories;
