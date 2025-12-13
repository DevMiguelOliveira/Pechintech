-- Adiciona campo parent_id para suporte a subcategorias
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE;

-- Remove campo icon (não será mais usado)
ALTER TABLE public.categories
DROP COLUMN IF EXISTS icon;

-- Cria índice para melhor performance em queries hierárquicas
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);

-- Comentário explicativo
COMMENT ON COLUMN public.categories.parent_id IS 'Referência à categoria pai. NULL significa categoria raiz (não é subcategoria)';



