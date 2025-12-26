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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Search, Loader2, Wand2, Link, CheckCircle2, AlertCircle } from 'lucide-react';
import { fetchLinkPreview } from '@/services/linkPreview';
import { toast } from '@/hooks/use-toast';

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
  coupon_code: null,
};

// Formata número para moeda brasileira (exibição)
const formatBRL = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte string formatada para número
const parseBRL = (value: string): number => {
  // Remove tudo exceto números e vírgula
  const cleaned = value.replace(/[^\d,]/g, '');
  // Substitui vírgula por ponto
  const normalized = cleaned.replace(',', '.');
  return parseFloat(normalized) || 0;
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
  
  // Estados para os campos de preço formatados
  const [currentPriceText, setCurrentPriceText] = useState(formatBRL(initialData.current_price));
  const [originalPriceText, setOriginalPriceText] = useState(formatBRL(initialData.original_price));
  
  // Estado para busca automática via Link Preview API
  const [isFetchingPreview, setIsFetchingPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(initialData.affiliate_url || '');
  
  // Função para buscar informações do link automaticamente
  const handleFetchLinkPreview = async () => {
    if (!previewUrl.trim()) {
      toast({
        title: 'URL não informada',
        description: 'Cole a URL do produto para buscar informações automaticamente.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsFetchingPreview(true);
    
    try {
      const result = await fetchLinkPreview(previewUrl);
      
      // Usa os dados principais ou fallback
      const dataToUse = result.data || result.fallback;
      
      if (dataToUse) {
        // Atualiza os campos do formulário com os dados extraídos
        setForm((prev) => ({
          ...prev,
          title: dataToUse.title || prev.title,
          description: dataToUse.description || prev.description,
          image_url: dataToUse.image || prev.image_url,
          affiliate_url: previewUrl,
          store: dataToUse.siteName || prev.store,
        }));
        
        if (result.success) {
          toast({
            title: 'Dados extraídos com sucesso!',
            description: 'Os campos foram preenchidos automaticamente. Revise e ajuste se necessário.',
          });
        } else {
          // Se usou fallback, mostra aviso mas não erro
          toast({
            title: 'Informações básicas extraídas',
            description: result.error || 'Alguns campos podem precisar de ajuste manual.',
            variant: 'default',
          });
        }
      } else {
        // Se não conseguiu nem fallback, tenta extrair pelo menos a loja
        try {
          const urlObj = new URL(previewUrl);
          const hostname = urlObj.hostname.replace(/^www\./, '');
          const storeName = hostname.split('.')[0];
          
          if (storeName && storeName.length > 2) {
            setForm((prev) => ({
              ...prev,
              affiliate_url: previewUrl,
              store: storeName.charAt(0).toUpperCase() + storeName.slice(1),
            }));
            
            toast({
              title: 'URL adicionada',
              description: 'Nome da loja extraído automaticamente. Preencha os demais campos.',
              variant: 'default',
            });
          } else {
            throw new Error('Não foi possível extrair informações');
          }
        } catch {
          toast({
            title: 'Não foi possível extrair',
            description: result.error || 'Tente preencher os campos manualmente.',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar link preview:', error);
      
      // Último recurso: tenta extrair pelo menos a loja da URL
      try {
        const urlObj = new URL(previewUrl);
        const hostname = urlObj.hostname.replace(/^www\./, '');
        const storeName = hostname.split('.')[0];
        
        if (storeName && storeName.length > 2) {
          setForm((prev) => ({
            ...prev,
            affiliate_url: previewUrl,
            store: storeName.charAt(0).toUpperCase() + storeName.slice(1),
          }));
          
          toast({
            title: 'URL adicionada',
            description: 'Nome da loja extraído automaticamente.',
            variant: 'default',
          });
        } else {
          throw new Error('Não foi possível extrair informações');
        }
      } catch {
        toast({
          title: 'Erro na busca',
          description: 'Ocorreu um erro ao buscar informações. Tente novamente.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsFetchingPreview(false);
    }
  };

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
    <form onSubmit={handleSubmit} className="space-y-2">
      {/* Seção de Busca Automática via Link Preview */}
      <div className="sm:col-span-2 p-2.5 sm:p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
        <div className="flex items-center gap-1.5">
          <Wand2 className="h-3.5 w-3.5 text-primary" />
          <Label className="text-[10px] sm:text-xs font-medium text-primary">Preenchimento Automático</Label>
        </div>
        <p className="text-[9px] sm:text-[10px] text-muted-foreground">
          Cole a URL do produto e clique em "Buscar" para preencher os campos automaticamente.
        </p>
        <div className="flex gap-1.5">
          <div className="relative flex-1">
            <Link className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              type="url"
              placeholder="https://www.loja.com.br/produto..."
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="h-7 sm:h-8 text-[11px] sm:text-xs pl-7"
            />
          </div>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleFetchLinkPreview}
            disabled={isFetchingPreview || !previewUrl.trim()}
            className="h-7 sm:h-8 px-2.5 sm:px-3 text-[10px] sm:text-xs whitespace-nowrap"
          >
            {isFetchingPreview ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Wand2 className="mr-1 h-3 w-3" />
                Buscar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-1.5 sm:gap-2 grid-cols-1 sm:grid-cols-2">
        {/* Título */}
        <div className="sm:col-span-2 space-y-0.5">
          <Label htmlFor="title" className="text-[10px] sm:text-xs">Título *</Label>
          <Input
            id="title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        {/* Descrição */}
        <div className="sm:col-span-2 space-y-0.5">
          <Label htmlFor="description" className="text-[10px] sm:text-xs">Descrição</Label>
          <Textarea
            id="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={1}
            className="text-[11px] sm:text-xs min-h-[28px] sm:min-h-[36px] resize-none"
            placeholder="Opcional"
          />
        </div>

        {/* URL da Imagem */}
        <div className="sm:col-span-2 space-y-0.5">
          <Label htmlFor="image_url" className="text-[10px] sm:text-xs">URL da Imagem *</Label>
          <Input
            id="image_url"
            type="url"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        {/* Preços */}
        <div className="space-y-0.5">
          <Label htmlFor="current_price" className="text-[10px] sm:text-xs">Preço Atual *</Label>
          <Input
            id="current_price"
            type="text"
            inputMode="decimal"
            value={currentPriceText}
            onChange={(e) => {
              setCurrentPriceText(e.target.value);
              setForm({ ...form, current_price: parseBRL(e.target.value) });
            }}
            onBlur={() => setCurrentPriceText(formatBRL(form.current_price))}
            placeholder="0,00"
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        <div className="space-y-0.5">
          <Label htmlFor="original_price" className="text-[10px] sm:text-xs">Preço Original *</Label>
          <Input
            id="original_price"
            type="text"
            inputMode="decimal"
            value={originalPriceText}
            onChange={(e) => {
              setOriginalPriceText(e.target.value);
              setForm({ ...form, original_price: parseBRL(e.target.value) });
            }}
            onBlur={() => setOriginalPriceText(formatBRL(form.original_price))}
            placeholder="0,00"
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        {/* URL Afiliado */}
        <div className="sm:col-span-2 space-y-0.5">
          <Label htmlFor="affiliate_url" className="text-[10px] sm:text-xs">URL de Afiliado *</Label>
          <Input
            id="affiliate_url"
            type="url"
            value={form.affiliate_url}
            onChange={(e) => {
              setForm({ ...form, affiliate_url: e.target.value });
              setPreviewUrl(e.target.value);
            }}
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        {/* Categoria e Loja */}
        <div className="space-y-0.5">
          <Label htmlFor="category" className="text-[10px] sm:text-xs">Categoria</Label>
          <Select
            value={form.category_id || 'none'}
            onValueChange={(value) =>
              setForm({ ...form, category_id: value === 'none' ? null : value })
            }
          >
            <SelectTrigger className="h-7 sm:h-8 text-[11px] sm:text-xs">
              <SelectValue placeholder="Selecione" />
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

        <div className="space-y-0.5">
          <Label htmlFor="store" className="text-[10px] sm:text-xs">Loja *</Label>
          <Input
            id="store"
            value={form.store}
            onChange={(e) => setForm({ ...form, store: e.target.value })}
            required
            className="h-7 sm:h-8 text-[11px] sm:text-xs"
          />
        </div>

        {/* Cupom de Desconto */}
        <div className="sm:col-span-2 space-y-0.5">
          <Label htmlFor="coupon_code" className="text-[10px] sm:text-xs">Cupom de Desconto</Label>
          <Input
            id="coupon_code"
            value={form.coupon_code || ''}
            onChange={(e) => setForm({ ...form, coupon_code: e.target.value.toUpperCase() || null })}
            placeholder="Ex: DESCONTO10"
            className="h-7 sm:h-8 text-[11px] sm:text-xs font-mono uppercase"
          />
        </div>

        {/* Especificações - Oculto em mobile */}
        <div className="hidden sm:block sm:col-span-2 space-y-0.5">
          <Label htmlFor="specs" className="text-[10px] sm:text-xs">Especificações</Label>
          <Textarea
            id="specs"
            value={specsText}
            onChange={(e) => setSpecsText(e.target.value)}
            placeholder="Chave: Valor (uma por linha)"
            rows={1}
            className="text-[11px] sm:text-xs min-h-[32px] resize-none"
          />
        </div>

        {/* Switch Ativo */}
        <div className="sm:col-span-2 flex items-center gap-2 py-1">
          <Switch
            id="is_active"
            checked={form.is_active}
            onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
            className="scale-90"
          />
          <Label htmlFor="is_active" className="text-[10px] sm:text-xs">Produto ativo</Label>
        </div>
      </div>

      {/* Botões */}
      <div className="flex gap-2 pt-1 border-t border-border/50">
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
            <Button size="sm" className="h-8 sm:h-9 text-xs sm:text-sm">
              <Plus className="mr-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[94vw] max-w-[340px] sm:max-w-md md:max-w-lg p-3 sm:p-4 max-h-[85vh] flex flex-col" aria-describedby="create-product-description">
            <DialogHeader className="pb-1 sm:pb-2 shrink-0">
              <DialogTitle className="text-sm sm:text-base">Novo Produto</DialogTitle>
              <DialogDescription id="create-product-description" className="text-[10px] sm:text-xs">
                Preencha os campos para cadastrar um novo produto.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-1">
              <ProductForm
                initialData={emptyForm}
                onSubmit={handleCreate}
                isLoading={createProduct.isPending}
                onCancel={() => setIsCreateOpen(false)}
              />
            </div>
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
        <DialogContent className="w-[94vw] max-w-[340px] sm:max-w-md md:max-w-lg p-3 sm:p-4 max-h-[85vh] flex flex-col" aria-describedby="edit-product-description">
          <DialogHeader className="pb-1 sm:pb-2 shrink-0">
            <DialogTitle className="text-sm sm:text-base">Editar Produto</DialogTitle>
            <DialogDescription id="edit-product-description" className="text-[10px] sm:text-xs">
              Altere os campos para atualizar o produto.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 pr-1">
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
                  coupon_code: editingProduct.coupon_code,
                }}
                onSubmit={handleUpdate}
                isLoading={updateProduct.isPending}
                onCancel={() => setEditingProduct(null)}
              />
            )}
          </div>
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
