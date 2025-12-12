import { useState } from 'react';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  DbProduct,
  ProductFormData,
} from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Search, Loader2 } from 'lucide-react';

const emptyForm: ProductFormData = {
  title: '',
  description: '',
  image_url: '',
  current_price: 0,
  original_price: 0,
  affiliate_url: '',
  category_id: null,
  store: '',
  specs: {},
  is_active: true,
};

const ProductForm = ({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: {
  initialData: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  isLoading: boolean;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(initialData);
  const { data: categories } = useCategories();
  const [specsText, setSpecsText] = useState(
    Object.entries(initialData.specs || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse specs from text
    const specs: Record<string, string> = {};
    specsText.split('\n').forEach((line) => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length > 0) {
        specs[key.trim()] = valueParts.join(':').trim();
      }
    });

    onSubmit({ ...form, specs });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
            rows={3}
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="image_url">URL da Imagem *</Label>
          <Input
            id="image_url"
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="current_price">Preço Atual (R$) *</Label>
          <Input
            id="current_price"
            type="number"
            step="0.01"
            min="0"
            value={form.current_price}
            onChange={(e) =>
              setForm({ ...form, current_price: parseFloat(e.target.value) || 0 })
            }
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="original_price">Preço Original (R$) *</Label>
          <Input
            id="original_price"
            type="number"
            step="0.01"
            min="0"
            value={form.original_price}
            onChange={(e) =>
              setForm({ ...form, original_price: parseFloat(e.target.value) || 0 })
            }
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="affiliate_url">URL de Afiliado *</Label>
          <Input
            id="affiliate_url"
            type="url"
            value={form.affiliate_url}
            onChange={(e) => setForm({ ...form, affiliate_url: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={form.category_id || 'none'}
            onValueChange={(value) =>
              setForm({ ...form, category_id: value === 'none' ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem categoria</SelectItem>
              {categories?.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="store">Loja *</Label>
          <Input
            id="store"
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="specs">
            Especificações (uma por linha, formato: "Chave: Valor")
          </Label>
          <Textarea
            id="specs"
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            placeholder="Memória: 16GB&#10;Processador: Intel i7"
            rows={4}
          />
        </div>

        <div className="flex items-center gap-2 sm:col-span-2">
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
          />
          <Label htmlFor="is_active">Produto ativo (visível no site)</Label>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </div>
    </form>
  );
};

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DbProduct | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<DbProduct | null>(null);

  const filteredProducts = products?.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.store.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = (data: ProductFormData) => {
    createProduct.mutate(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  const handleUpdate = (data: ProductFormData) => {
    if (!editingProduct) return;
    updateProduct.mutate(
      { id: editingProduct.id, ...data },
      { onSuccess: () => setEditingProduct(null) }
    );
  };

  const handleDelete = () => {
    if (!deletingProduct) return;
    deleteProduct.mutate(deletingProduct.id, {
      onSuccess: () => setDeletingProduct(null),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os produtos do site
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Produto</DialogTitle>
            </DialogHeader>
            <ProductForm
              initialData={emptyForm}
              onSubmit={handleCreate}
              isLoading={createProduct.isPending}
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredProducts?.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              Nenhum produto encontrado.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Imagem</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead className="hidden md:table-cell">Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px]">
                          <p className="font-medium truncate">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.store}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {product.categories?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-primary">
                            R$ {product.current_price.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground line-through">
                            R$ {product.original_price.toFixed(2)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {product.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeletingProduct(product)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              initialData={{
                title: editingProduct.title,
                description: editingProduct.description,
                image_url: editingProduct.image_url,
                current_price: editingProduct.current_price,
                original_price: editingProduct.original_price,
                affiliate_url: editingProduct.affiliate_url,
                category_id: editingProduct.category_id,
                store: editingProduct.store,
                specs: editingProduct.specs || {},
                is_active: editingProduct.is_active,
              }}
              onSubmit={handleUpdate}
              isLoading={updateProduct.isPending}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto "{deletingProduct?.title}" será
              removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProduct.isPending && (
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

export default Products;
